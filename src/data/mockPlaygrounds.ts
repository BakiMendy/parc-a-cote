import type { Playground } from '@/types';

// Données fictives pour les parcs (utilisées en cas d'erreur de connexion à Supabase)
export const mockPlaygrounds: Playground[] = [
  {
    id: "1",
    name: "Parc de la Tête d'Or",
    description: "Grand parc avec plusieurs aires de jeux pour enfants de tous âges. Comprend des balançoires, toboggans, structures d'escalade et bac à sable.",
    address: "Place Général Leclerc",
    city: "Lyon",
    postalCode: "69006",
    latitude: 45.7741,
    longitude: 4.8553,
    images: [
      { 
        id: "1", 
        url: "https://source.unsplash.com/random/800x600/?playground,park&sig=1", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      },
      { 
        id: "2", 
        url: "https://source.unsplash.com/random/800x600/?playground,children&sig=2", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      }
    ],
    features: ["Toboggan", "Balançoires", "Bac à sable", "Tables de pique-nique", "Point d'eau", "Zone ombragée"],
    ageRange: "2-12 ans",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user1"
  },
  {
    id: "2",
    name: "Parc Blandan",
    description: "Aire de jeux moderne avec structures en bois et métal. Idéal pour les enfants de 3 à 10 ans.",
    address: "Rue du Repos",
    city: "Lyon",
    postalCode: "69007",
    latitude: 45.7456,
    longitude: 4.8563,
    images: [
      { 
        id: "3", 
        url: "https://source.unsplash.com/random/800x600/?playground,slide&sig=3", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      },
      { 
        id: "4", 
        url: "https://source.unsplash.com/random/800x600/?playground,climbing&sig=4", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      }
    ],
    features: ["Toboggan", "Structure d'escalade", "Sol souple"],
    ageRange: "3-10 ans",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user1"
  },
  {
    id: "3",
    name: "Parc de la Feyssine",
    description: "Aire de jeux naturelle au bord du Rhône. Structures en bois et cordes, parfait pour les aventuriers.",
    address: "Chemin de la Feyssine",
    city: "Villeurbanne",
    postalCode: "69100",
    latitude: 45.7842,
    longitude: 4.8813,
    images: [
      { 
        id: "5", 
        url: "https://source.unsplash.com/random/800x600/?playground,nature&sig=5", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      },
      { 
        id: "6", 
        url: "https://source.unsplash.com/random/800x600/?playground,rope&sig=6", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      }
    ],
    features: ["Structure d'escalade", "Tables de pique-nique", "Balade à pied"],
    ageRange: "4-12 ans",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user2"
  },
  {
    id: "4",
    name: "Parc Saint-Clair",
    description: "Petit parc ombragé avec aire de jeux sécurisée pour les tout-petits. Balançoires et petit toboggan.",
    address: "Quai Clemenceau",
    city: "Caluire-et-Cuire",
    postalCode: "69300",
    latitude: 45.7892,
    longitude: 4.8436,
    images: [
      { 
        id: "7", 
        url: "https://source.unsplash.com/random/800x600/?playground,toddler&sig=7", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      }
    ],
    features: ["Toboggan", "Balançoires", "Espace tout-petits", "Espace clôturé", "Zone ombragée"],
    ageRange: "1-6 ans",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user2"
  },
  {
    id: "5",
    name: "Parc du Grand Large",
    description: "Grande aire de jeux avec vue sur le lac. Structures modernes et sol souple pour la sécurité.",
    address: "Avenue des Canuts",
    city: "Vaulx-en-Velin",
    postalCode: "69120",
    latitude: 45.7778,
    longitude: 4.9319,
    images: [
      { 
        id: "8", 
        url: "https://source.unsplash.com/random/800x600/?playground,lake&sig=8", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      },
      { 
        id: "9", 
        url: "https://source.unsplash.com/random/800x600/?playground,modern&sig=9", 
        status: "approved", 
        createdAt: new Date().toISOString() 
      }
    ],
    features: ["Toboggan", "Structure d'escalade", "Sol souple", "Jeux inclusifs", "Accès PMR"],
    ageRange: "2-14 ans",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user3"
  }
];