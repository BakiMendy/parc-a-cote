import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { MapPinIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getValidImageUrl, getFallbackImageUrl } from '@/lib/images';
import type { Playground } from '@/types';

interface NearbyPlaygroundsProps {
  playgrounds: Playground[];
  onShowMore: () => void;
  onPlaygroundClick: (playground: Playground) => void;
  searchRadius?: number;
  onRadiusChange?: (radius: number) => void;
}

export function NearbyPlaygrounds({ 
  playgrounds,
  onShowMore,
  onPlaygroundClick,
  searchRadius = 20,
  onRadiusChange
}: NearbyPlaygroundsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [radius, setRadius] = useState(searchRadius);
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Nettoyer lors du démontage
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    // Précharger les images pour chaque parc
    const urls: {[key: string]: string} = {};
    const loaded: {[key: string]: boolean} = {};
    
    playgrounds.forEach(playground => {
      const url = getValidImageUrl(playground.images);
      urls[playground.id] = url;
      loaded[playground.id] = false;
      
      const img = new Image();
      img.onload = () => {
        if (isMounted.current) {
          setImagesLoaded(prev => ({...prev, [playground.id]: true}));
        }
      };
      img.onerror = () => {
        if (isMounted.current) {
          // En cas d'erreur, utiliser l'image de secours
          const fallbackUrl = getFallbackImageUrl(playground.id);
          urls[playground.id] = fallbackUrl;
          setImageUrls(prev => ({...prev, [playground.id]: fallbackUrl}));
          setImagesLoaded(prev => ({...prev, [playground.id]: true}));
        }
      };
      img.src = url;
    });
    
    setImageUrls(urls);
  }, [playgrounds]);

  const handleImageError = (playgroundId: string) => {
    const fallbackUrl = getFallbackImageUrl(playgroundId);
    setImageUrls(prev => ({...prev, [playgroundId]: fallbackUrl}));
  };

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  return (
    <div className={cn(
      "absolute left-0 top-0 bg-white rounded-lg shadow-lg transition-all duration-300",
      "w-full max-w-[320px] sm:w-80 z-10",
      "mx-auto sm:mx-4 sm:left-4 sm:top-4",
      isCollapsed ? "h-12" : "h-[500px]"
    )}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer border-b"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="text-lg font-semibold">Parcs à proximité</h2>
        {isCollapsed ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </div>

      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "h-0 opacity-0" : "h-[calc(500px-4rem)] opacity-100"
      )}>
        {onRadiusChange && (
          <div className="px-4 pt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Rayon de recherche</span>
              <span className="text-sm text-muted-foreground">{radius} km</span>
            </div>
            <Slider
              value={[radius]}
              min={1}
              max={50}
              step={1}
              onValueChange={handleRadiusChange}
              className="mb-4"
            />
          </div>
        )}
        
        <ScrollArea className="h-[calc(100%-8rem)] p-4">
          <div className="space-y-4">
            {playgrounds.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun parc trouvé à proximité
              </p>
            ) : (
              playgrounds.map(playground => (
                <div
                  key={playground.id}
                  className="p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onPlaygroundClick(playground)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                      {imagesLoaded[playground.id] ? (
                        <img
                          src={imageUrls[playground.id] || getFallbackImageUrl(playground.id)}
                          alt={playground.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => handleImageError(playground.id)}
                        />
                      ) : (
                        <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{playground.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{playground.city}</span>
                      </p>
                      {playground.distance !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {playground.distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {playgrounds.length > 0 && (
          <div className="p-4 border-t">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onShowMore();
              }}
            >
              Afficher plus de parcs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}