import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '@/config/maps';

interface MapPickerProps {
  marker: google.maps.LatLng | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
}

export function MapPicker({ marker, onMapClick }: MapPickerProps) {
  return (
    <div className="h-[400px] rounded-lg overflow-hidden border-2 border-accent/20">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={marker || GOOGLE_MAPS_CONFIG.defaultCenter}
        zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
        options={GOOGLE_MAPS_CONFIG.mapOptions}
        onClick={onMapClick}
      >
        {marker && <MarkerF position={marker} />}
      </GoogleMap>
    </div>
  );
}