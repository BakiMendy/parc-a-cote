import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPinIcon } from 'lucide-react';

interface AddressInputProps {
  onSearch: (address: string) => void;
  initialAddress?: string;
}

export function AddressInput({ onSearch, initialAddress = '' }: AddressInputProps) {
  const [address, setAddress] = useState(initialAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Entrez une adresse..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1"
      />
      <Button 
        type="button"
        variant="secondary"
        onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
      >
        <MapPinIcon className="h-4 w-4 mr-2" />
        Rechercher
      </Button>
    </div>
  );
}