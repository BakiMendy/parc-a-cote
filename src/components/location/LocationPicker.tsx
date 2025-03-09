import { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { AddressInput } from './AddressInput';
import { MapPicker } from './MapPicker';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG } from '@/config/maps';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [];

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries,
  });

  const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
  const [address, setAddress] = useState('');

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    setMarker(e.latLng);
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: e.latLng });
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    }
  };

  const handleAddressSearch = async (searchAddress: string) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchAddress });
      
      if (result.results[0]?.geometry?.location) {
        setMarker(result.results[0].geometry.location);
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    }
  };

  const handleConfirm = () => {
    if (marker && address) {
      onLocationSelect({
        lat: marker.lat(),
        lng: marker.lng(),
        address,
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AddressInput onSearch={handleAddressSearch} initialAddress={address} />
      
      <MapPicker marker={marker} onMapClick={handleMapClick} />

      <Button 
        onClick={handleConfirm}
        className="w-full btn-playful"
        disabled={!marker || !address}
      >
        Confirmer l'emplacement
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Cliquez sur la carte ou entrez une adresse pour sélectionner l'emplacement
      </p>
    </div>
  );
}