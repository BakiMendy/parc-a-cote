import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function MapLoadingError({ error }: { error: string }) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Map</AlertTitle>
      <AlertDescription>
        {error}. Please check your API key configuration and network connection.
      </AlertDescription>
    </Alert>
  );
}