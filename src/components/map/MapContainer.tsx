import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_CONFIG } from '@/config/maps';
import type { Playground } from '@/types';

interface MapContainerProps {
  center: google.maps.LatLngLiteral;
  userLocation?: GeolocationCoordinates;
  playgrounds: Playground[];
  onPlaygroundClick: (playground: Playground) => void;
}

export function MapContainer({ 
  center, 
  userLocation, 
  playgrounds, 
  onPlaygroundClick 
}: MapContainerProps) {
  const [hoveredPlayground, setHoveredPlayground] = useState<Playground | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Ajuster la vue de la carte pour inclure tous les marqueurs
  useEffect(() => {
    if (map && playgrounds.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      // Ajouter la position de l'utilisateur si disponible
      if (userLocation) {
        bounds.extend({
          lat: userLocation.latitude,
          lng: userLocation.longitude
        });
      }
      
      // Ajouter tous les parcs
      playgrounds.forEach(playground => {
        bounds.extend({
          lat: playground.latitude,
          lng: playground.longitude
        });
      });
      
      // Ajuster la vue
      map.fitBounds(bounds);
      
      // Si un seul point, zoomer un peu
      if (playgrounds.length === 1 && !userLocation) {
        map.setZoom(15);
      }
    }
  }, [map, playgrounds, userLocation]);

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={center}
      zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
      options={GOOGLE_MAPS_CONFIG.mapOptions}
      onLoad={setMap}
    >
      {userLocation && (
        <MarkerF
          position={{
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40)
          }}
          title="Votre position"
        />
      )}

      {playgrounds.map((playground) => (
        <MarkerF
          key={playground.id}
          position={{
            lat: playground.latitude,
            lng: playground.longitude,
          }}
          onClick={() => onPlaygroundClick(playground)}
          onMouseOver={() => setHoveredPlayground(playground)}
          onMouseOut={() => setHoveredPlayground(null)}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          }}
          animation={google.maps.Animation.DROP}
          title={playground.name}
        />
      ))}

      {hoveredPlayground && (
        <InfoWindowF
          position={{
            lat: hoveredPlayground.latitude,
            lng: hoveredPlayground.longitude,
          }}
          onCloseClick={() => setHoveredPlayground(null)}
        >
          <div className="p-2">
            <h3 className="font-medium text-sm">{hoveredPlayground.name}</h3>
            <p className="text-xs text-gray-600">{hoveredPlayground.city}</p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}