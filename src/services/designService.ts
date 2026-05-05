import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment, 
  serverTimestamp,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Design, Review, Inquiry, Category } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const designService = {
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error: any) {
      if (error.message?.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  },

  async getAllDesigns(category?: Category, searchTerm?: string) {
    const path = 'designs';
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      const snapshot = await getDocs(q);
      let designs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Design));
      
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        designs = designs.filter(d => 
          d.title.toLowerCase().includes(lowerSearch) || 
          d.description.toLowerCase().includes(lowerSearch) ||
          d.tags.some(t => t.toLowerCase().includes(lowerSearch))
        );
      }
      
      return designs;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getFeatured() {
    const path = 'designs';
    try {
      const q = query(collection(db, path), where('featured', '==', true), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Design));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getDesign(id: string) {
    const path = `designs/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'designs', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Design;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createDesign(design: Omit<Design, 'id' | 'likes' | 'views' | 'createdAt'>) {
    const path = 'designs';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...design,
        likes: 0,
        views: 0,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async incrementLikes(id: string) {
    const path = `designs/${id}`;
    try {
      await updateDoc(doc(db, 'designs', id), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async incrementViews(id: string) {
    const path = `designs/${id}`;
    try {
      await updateDoc(doc(db, 'designs', id), {
        views: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getReviews(designId: string, callback: (reviews: Review[]) => void) {
    const path = `designs/${designId}/reviews`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        callback(reviews);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async addReview(designId: string, review: Omit<Review, 'id' | 'createdAt'>) {
    const path = `designs/${designId}/reviews`;
    try {
      await addDoc(collection(db, path), {
        ...review,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteDesign(id: string) {
    const path = `designs/${id}`;
    try {
      await deleteDoc(doc(db, 'designs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async getInquiries(callback: (inquiries: Inquiry[]) => void) {
    const path = 'inquiries';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
        callback(inquiries);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async deleteInquiry(id: string) {
    const path = `inquiries/${id}`;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async sendInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>) {
    const path = 'inquiries';
    try {
      await addDoc(collection(db, path), {
        ...inquiry,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
