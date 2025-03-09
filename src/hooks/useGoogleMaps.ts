import { useLoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, MAPS_LIBRARIES } from '@/config/maps';

export function useGoogleMaps() {
  return useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: MAPS_LIBRARIES,
  });
}