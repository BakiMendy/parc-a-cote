import { toast } from 'sonner';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!MAPS_API_KEY) {
  console.error('Google Maps API key is missing');
  toast.error('Error loading maps configuration');
}

export const GOOGLE_MAPS_CONFIG = {
  apiKey: MAPS_API_KEY || '',
  defaultCenter: {
    lat: 45.7578,
    lng: 4.8320
  },
  defaultZoom: 13,
  mapOptions: {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  }
};

export const MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];