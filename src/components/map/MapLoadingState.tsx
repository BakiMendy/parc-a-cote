import { Loader2 } from 'lucide-react';

export function MapLoadingState() {
  return (
    <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}