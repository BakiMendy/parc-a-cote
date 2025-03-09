import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { useGeolocation } from '@/lib/maps';
import { NearbyPlaygrounds } from '@/components/map/NearbyPlaygrounds';
import { PlaygroundDetails } from '@/components/playground/PlaygroundDetails';
import { MapContainer } from '@/components/map/MapContainer';
import { Loader2Icon, AlertCircle } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG, MAPS_LIBRARIES } from '@/config/maps';
import { usePlaygrounds } from '@/hooks/usePlaygrounds';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Playground } from '@/types';

export function MapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: MAPS_LIBRARIES,
  });

  const { location, error: locationError } = useGeolocation();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  const [showAllPlaygrounds, setShowAllPlaygrounds] = useState(false);
  const initialLoadDone = useRef(false);
  const [searchRadius, setSearchRadius] = useState(20); // Rayon de recherche en km

  // Obtenir la position de l'utilisateur pour le centre de la carte
  const center = useMemo(() => {
    if (location) {
      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    }
    return GOOGLE_MAPS_CONFIG.defaultCenter;
  }, [location]);

  // Récupérer les parcs depuis Supabase
  const userLocation = location ? {
    lat: location.coords.latitude,
    lng: location.coords.longitude
  } : undefined;
  
  const { playgrounds, loading: playgroundsLoading, error: playgroundsError } = usePlaygrounds(userLocation);

  // Filtrer les parcs à afficher (tous ou seulement ceux dans le rayon de recherche)
  const visiblePlaygrounds = useMemo(() => {
    // Filtrer par distance si l'utilisateur a partagé sa position
    if (userLocation) {
      return playgrounds
        .filter(p => p.distance !== undefined && p.distance <= searchRadius)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
        .slice(0, showAllPlaygrounds ? undefined : 10);
    }
    
    // Sinon, afficher tous les parcs
    return playgrounds
      .slice(0, showAllPlaygrounds ? undefined : 10);
  }, [playgrounds, showAllPlaygrounds, userLocation, searchRadius]);

  const handlePlaygroundClick = useCallback((playground: Playground) => {
    setSelectedPlayground(playground);
  }, []);

  // Vérifier si un parc spécifique est demandé dans l'URL
  useEffect(() => {
    if (playgrounds.length > 0 && !initialLoadDone.current) {
      const params = new URLSearchParams(window.location.search);
      const playgroundId = params.get('playground');
      
      if (playgroundId) {
        const playground = playgrounds.find(p => p.id === playgroundId);
        if (playground) {
          setSelectedPlayground(playground);
          initialLoadDone.current = true;
        }
      }
    }
  }, [playgrounds]);

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-73px)] flex items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-73px)]">
      <MapContainer
        center={center}
        userLocation={location?.coords}
        playgrounds={visiblePlaygrounds}
        onPlaygroundClick={handlePlaygroundClick}
      />

      {playgroundsLoading && playgrounds.length === 0 ? (
        <div className="absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center space-x-2">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            <span>Chargement des parcs...</span>
          </div>
        </div>
      ) : playgrounds.length > 0 ? (
        <NearbyPlaygrounds
          playgrounds={visiblePlaygrounds}
          onShowMore={() => setShowAllPlaygrounds(true)}
          onPlaygroundClick={handlePlaygroundClick}
          searchRadius={searchRadius}
          onRadiusChange={setSearchRadius}
        />
      ) : (
        <div className="absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-[320px]">
          <p className="text-muted-foreground">Aucun parc trouvé à proximité.</p>
        </div>
      )}

      <PlaygroundDetails
        playground={selectedPlayground}
        onClose={() => setSelectedPlayground(null)}
        userLocation={userLocation}
      />

      {(locationError || playgroundsError) && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96">
          <Alert variant={playgroundsError ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {locationError || (playgroundsError ? "Utilisation des données locales en raison d'un problème de connexion." : "")}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}