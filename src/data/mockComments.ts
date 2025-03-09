import type { Comment } from '@/types';

export const mockComments: Comment[] = [
  {
    id: "1",
    playgroundId: "1",
    content: "Superbe parc avec beaucoup d'activités pour les enfants. Les aires de jeux sont bien entretenues.",
    rating: 5,
    author: "Parent123",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours avant
  },
  {
    id: "2",
    playgroundId: "1",
    content: "Très agréable, mais peut être bondé le week-end. Préférez y aller en semaine.",
    rating: 4,
    author: "MamanLyon",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 jours avant
  },
  {
    id: "3",
    playgroundId: "2",
    content: "Aire de jeux moderne et sécurisée. Mes enfants ont adoré les structures d'escalade.",
    rating: 5,
    author: "PapaActif",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 jours avant
  },
  {
    id: "4",
    playgroundId: "3",
    content: "Cadre naturel magnifique. Parfait pour une journée en famille.",
    rating: 5,
    author: "NatureLover",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 jours avant
  },
  {
    id: "5",
    playgroundId: "4",
    content: "Idéal pour les tout-petits. L'espace clôturé est très rassurant.",
    rating: 4,
    author: "MamanDeJumeaux",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 jours avant
  },
  {
    id: "6",
    playgroundId: "5",
    content: "Vue magnifique et équipements modernes. Accessible aux enfants à mobilité réduite.",
    rating: 5,
    author: "InclusionParent",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 jours avant
  }
];