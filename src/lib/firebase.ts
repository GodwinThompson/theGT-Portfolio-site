import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Critical: The app will use the provided database ID if available, defaulting to (default)
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

/**
 * Validates connection to Firestore as per instructions.
 * If this fails with 'unavailable', it's likely a network or provisioning issue.
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    console.log("Firebase connection: OK");
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.error("Firebase connection error: The Cloud Firestore backend is currently unreachable. This is often transient.");
    }
  }
}
