export type Category = "Social Media Designs" | "Web3 Designs" | "Print Media" | "Flyers/Posters" | "Product Designs" | "Motion Graphics";

export interface Design {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  category: Category;
  tags: string[];
  likes: number;
  views: number;
  authorId: string;
  createdAt: any; // Firestore Timestamp
  featured?: boolean;
}

export interface Review {
  id: string;
  reviewerName: string;
  comment: string;
  createdAt: any;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: any;
}
