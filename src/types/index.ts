export interface Comment {
  id: string;
  playgroundId: string;
  content: string;
  rating: number;
  author: string;
  createdAt: string;
}

export interface Playground {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  images: PlaygroundImage[];
  features: string[];
  ageRange: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedBy: string;
  distance?: number;
  equipmentIds?: string[];
}

export interface PlaygroundImage {
  id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}