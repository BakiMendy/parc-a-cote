import { useState, useEffect } from 'react';
import { getPlaygrounds, getPlaygroundById } from '@/lib/supabase';
import { calculateDistance } from '@/lib/maps';
import { equipments } from '@/data/equipments';
import { mockPlaygrounds } from '@/data/mockPlaygrounds';
import { preloadImages, getValidImageUrl } from '@/lib/images';
import type { Playground } from '@/types';

// Cache pour stocker les parcs déjà chargés
const playgroundsCache: {
  data: Playground[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// Durée de validité du cache en millisecondes (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function usePlaygrounds(userLocation?: { lat: number; lng: number }) {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaygrounds() {
      try {
        setLoading(true);
        
        // Vérifier si nous avons des données en cache valides
        const now = Date.now();
        if (playgroundsCache.data && (now - playgroundsCache.timestamp < CACHE_DURATION)) {
          console.log("Using cached playgrounds data");
          
          // Mettre à jour les distances si la position de l'utilisateur est disponible
          const playgroundsWithDistance = playgroundsCache.data.map(pg => ({
            ...pg,
            distance: userLocation 
              ? calculateDistance(
                  userLocation.lat, 
                  userLocation.lng, 
                  pg.latitude, 
                  pg.longitude
                ) 
              : undefined
          }));
          
          // Trier par distance si disponible
          if (userLocation) {
            playgroundsWithDistance.sort((a, b) => 
              (a.distance || Infinity) - (b.distance || Infinity)
            );
          }
          
          setPlaygrounds(playgroundsWithDistance);
          setLoading(false);
          return;
        }
        
        // Préparer les données mockées comme fallback
        const formattedMockPlaygrounds = mockPlaygrounds.map(pg => ({
          ...pg,
          distance: userLocation 
            ? calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                pg.latitude, 
                pg.longitude
              ) 
            : undefined
        }));
        
        // Afficher immédiatement les données mockées pendant le chargement
        setPlaygrounds(formattedMockPlaygrounds);
        
        // Essayer de récupérer les données depuis Supabase
        try {
          const { data, error } = await getPlaygrounds();
          
          if (error) {
            console.error("Error fetching playgrounds:", error);
            // Garder les données mockées déjà affichées
            setError("Impossible de se connecter à la base de données. Affichage des données locales.");
            return;
          }
          
          if (!data || data.length === 0) {
            console.log("No playgrounds found in Supabase, using mock data");
            // Garder les données mockées déjà affichées
            return;
          }
          
          // Transformer les données Supabase en format Playground
          const formattedPlaygrounds: Playground[] = data.map(pg => {
            // Convertir les IDs d'équipement en noms de caractéristiques
            const features = pg.equipment_ids 
              ? pg.equipment_ids.map(id => {
                  const equipment = equipments.find(e => e.id === id);
                  return equipment ? equipment.label : id;
                })
              : [];

            return {
              id: pg.id,
              name: pg.name,
              description: pg.description,
              address: pg.address,
              city: pg.city,
              postalCode: pg.postal_code,
              latitude: pg.latitude,
              longitude: pg.longitude,
              images: pg.playground_images ? pg.playground_images.map(img => ({
                id: img.id,
                url: img.url,
                status: img.status,
                createdAt: img.created_at
              })) : [],
              features: features,
              ageRange: pg.age_range,
              status: pg.status,
              createdAt: pg.created_at,
              updatedAt: pg.updated_at,
              submittedBy: pg.submitted_by,
              equipmentIds: pg.equipment_ids || [],
              distance: userLocation 
                ? calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    pg.latitude, 
                    pg.longitude
                  ) 
                : undefined
            };
          });

          // Trier par distance si disponible
          if (userLocation) {
            formattedPlaygrounds.sort((a, b) => 
              (a.distance || Infinity) - (b.distance || Infinity)
            );
          }

          // Mettre à jour le cache
          playgroundsCache.data = formattedPlaygrounds;
          playgroundsCache.timestamp = now;

          // Précharger les images en arrière-plan
          const imageUrls = formattedPlaygrounds
            .flatMap(pg => pg.images.map(img => img.url))
            .filter(url => url && url.startsWith('http'))
            .slice(0, 10); // Limiter à 10 images pour éviter de surcharger
          
          if (imageUrls.length > 0) {
            preloadImages(imageUrls).catch(err => 
              console.error("Error preloading images:", err)
            );
          }

          setPlaygrounds(formattedPlaygrounds);
          setError(null);
        } catch (supabaseError) {
          console.error("Supabase error, falling back to mock data:", supabaseError);
          // Garder les données mockées déjà affichées
          setError("Impossible de se connecter à la base de données. Affichage des données locales.");
        }
      } catch (err) {
        console.error('Erreur lors du chargement des parcs:', err);
        // Garder les données mockées déjà affichées
        setError("Impossible de se connecter à la base de données. Affichage des données locales.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaygrounds();
  }, [userLocation]);

  return { playgrounds, loading, error };
}

// Cache pour les parcs individuels
const playgroundDetailCache: {
  [id: string]: {
    data: Playground;
    timestamp: number;
  }
} = {};

export function usePlayground(id: string) {
  const [playground, setPlayground] = useState<Playground | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayground() {
      try {
        setLoading(true);
        
        // Vérifier si nous avons des données en cache valides pour ce parc
        const now = Date.now();
        if (playgroundDetailCache[id] && (now - playgroundDetailCache[id].timestamp < CACHE_DURATION)) {
          console.log(`Using cached data for playground ${id}`);
          setPlayground(playgroundDetailCache[id].data);
          setLoading(false);
          return;
        }
        
        // Vérifier si le parc existe dans le cache global
        if (playgroundsCache.data && (now - playgroundsCache.timestamp < CACHE_DURATION)) {
          const cachedPlayground = playgroundsCache.data.find(p => p.id === id);
          if (cachedPlayground) {
            console.log(`Found playground ${id} in global cache`);
            setPlayground(cachedPlayground);
            
            // Mettre à jour le cache individuel
            playgroundDetailCache[id] = {
              data: cachedPlayground,
              timestamp: now
            };
            
            setLoading(false);
            return;
          }
        }
        
        // Chercher dans les données mockées
        const mockPlayground = mockPlaygrounds.find(p => p.id === id);
        
        // Afficher immédiatement les données mockées pendant le chargement
        if (mockPlayground) {
          setPlayground(mockPlayground);
        }
        
        // Essayer de récupérer depuis Supabase
        try {
          const { data, error } = await getPlaygroundById(id);
          
          if (error) {
            console.error(`Error fetching playground ${id}:`, error);
            // Si nous avons déjà affiché des données mockées, les garder
            if (mockPlayground) {
              return;
            }
            throw error;
          }
          
          if (!data) {
            // Si nous avons déjà affiché des données mockées, les garder
            if (mockPlayground) {
              return;
            }
            
            setPlayground(null);
            return;
          }

          // Convertir les IDs d'équipement en noms de caractéristiques
          const features = data.equipment_ids 
            ? data.equipment_ids.map(id => {
                const equipment = equipments.find(e => e.id === id);
                return equipment ? equipment.label : id;
              })
            : [];

          // Transformer les données Supabase en format Playground
          const formattedPlayground: Playground = {
            id: data.id,
            name: data.name,
            description: data.description,
            address: data.address,
            city: data.city,
            postalCode: data.postal_code,
            latitude: data.latitude,
            longitude: data.longitude,
            images: data.playground_images ? data.playground_images.map(img => ({
              id: img.id,
              url: img.url,
              status: img.status,
              createdAt: img.created_at
            })) : [],
            features: features,
            ageRange: data.age_range,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            submittedBy: data.submitted_by,
            equipmentIds: data.equipment_ids || []
          };

          // Mettre à jour le cache individuel
          playgroundDetailCache[id] = {
            data: formattedPlayground,
            timestamp: now
          };

          // Précharger les images
          if (formattedPlayground.images && formattedPlayground.images.length > 0) {
            const imageUrls = formattedPlayground.images
              .map(img => img.url)
              .filter(url => url && url.startsWith('http'));
            
            if (imageUrls.length > 0) {
              preloadImages(imageUrls).catch(err => 
                console.error("Error preloading images:", err)
              );
            }
          }

          setPlayground(formattedPlayground);
          setError(null);
        } catch (supabaseError) {
          console.error(`Supabase error, looking for playground ${id} in mock data:`, supabaseError);
          
          // Si nous avons déjà affiché des données mockées, les garder
          if (mockPlayground) {
            return;
          }
          
          throw new Error(`Parc non trouvé avec l'ID: ${id}`);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du parc:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPlayground();
    }
  }, [id]);

  return { playground, loading, error };
}