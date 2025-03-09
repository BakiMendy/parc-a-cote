import {
  ArrowDownWideNarrow, // For slide
  Orbit, // For swing
  Waves, // For sandbox
  Mountain, // For climbing structure
  Table2,
  Droplet,
  Umbrella,
  Baby,
  Accessibility,
  Heart,
  PersonStanding,
  Fence,
  Footprints,
  type LucideIcon
} from 'lucide-react';

export interface Equipment {
  id: string;
  label: string;
  icon: LucideIcon;
  category: 'play' | 'comfort' | 'safety' | 'accessibility';
}

export const equipments: Equipment[] = [
  // Jeux
  {
    id: 'slide',
    label: 'Toboggan',
    icon: ArrowDownWideNarrow,
    category: 'play'
  },
  {
    id: 'swing',
    label: 'Balançoires',
    icon: Orbit,
    category: 'play'
  },
  {
    id: 'sandbox',
    label: 'Bac à sable',
    icon: Waves,
    category: 'play'
  },
  {
    id: 'climbing',
    label: 'Structure d\'escalade',
    icon: Mountain,
    category: 'play'
  },
  
  // Confort
  {
    id: 'picnic',
    label: 'Tables de pique-nique',
    icon: Table2,
    category: 'comfort'
  },
  {
    id: 'water',
    label: 'Point d\'eau',
    icon: Droplet,
    category: 'comfort'
  },
  {
    id: 'shade',
    label: 'Zone ombragée',
    icon: Umbrella,
    category: 'comfort'
  },
  
  // Sécurité
  {
    id: 'fenced',
    label: 'Espace clôturé',
    icon: Fence,
    category: 'safety'
  },
  {
    id: 'rubber',
    label: 'Sol souple',
    icon: Footprints,
    category: 'safety'
  },
  
  // Accessibilité
  {
    id: 'toddler',
    label: 'Espace tout-petits',
    icon: Baby,
    category: 'accessibility'
  },
  {
    id: 'wheelchair',
    label: 'Accès PMR',
    icon: Accessibility,
    category: 'accessibility'
  },
  {
    id: 'walking',
    label: 'Balade à pied',
    icon: PersonStanding,
    category: 'accessibility'
  },
  {
    id: 'inclusive',
    label: 'Jeux inclusifs',
    icon: Heart,
    category: 'accessibility'
  }
];