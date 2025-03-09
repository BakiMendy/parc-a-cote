import { useState, useEffect } from 'react';
import { PlaygroundCard } from '@/components/playground/PlaygroundCard';
import { Input } from '@/components/ui/input';
import { SearchIcon, Loader2 } from 'lucide-react';
import { usePlaygrounds } from '@/hooks/usePlaygrounds';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Playground } from '@/types';

export function PlaygroundsPage() {
  const { playgrounds, loading, error } = usePlaygrounds();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaygrounds, setFilteredPlaygrounds] = useState<Playground[]>([]);

  useEffect(() => {
    if (playgrounds) {
      const query = searchQuery.toLowerCase();
      const filtered = playgrounds.filter(playground => 
        playground.name.toLowerCase().includes(query) ||
        playground.city.toLowerCase().includes(query)
      );
      setFilteredPlaygrounds(filtered);
    }
  }, [playgrounds, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher un parc par nom ou ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement des parcs...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredPlaygrounds.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery ? 'Aucun parc ne correspond à votre recherche.' : 'Aucun parc disponible pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaygrounds.map((playground) => (
            <PlaygroundCard
              key={playground.id}
              playground={playground}
              onClick={() => window.location.href = `/map?playground=${playground.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}