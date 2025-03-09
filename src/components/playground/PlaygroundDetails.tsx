import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Carousel } from '@/components/ui/carousel';
import { MapIcon, NavigationIcon, MapPinIcon } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { PlaygroundFeatures } from './PlaygroundFeatures';
import { PlaygroundDescription } from './PlaygroundDescription';
import { getValidImageUrl, getFallbackImageUrl, preloadImagesSequentially } from '@/lib/images';
import { useState, useEffect, useRef } from 'react';
import type { Playground } from '@/types';

interface PlaygroundDetailsProps {
  playground: Playground | null;
  onClose: () => void;
  userLocation?: { lat: number; lng: number };
}

export function PlaygroundDetails({ playground, onClose, userLocation }: PlaygroundDetailsProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Nettoyer lors du démontage
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (playground) {
      setImagesLoaded(false);
      
      // Générer des URLs d'images valides
      if (playground.images && playground.images.length > 0) {
        const urls = playground.images.map((img, index) => 
          getValidImageUrl([img], 0, getFallbackImageUrl(`${playground.id}-${index}`))
        );
        setImageUrls(urls);
        
        // Précharger les images en séquence pour éviter de surcharger le réseau
        preloadImagesSequentially(urls, 2)
          .then(() => {
            if (isMounted.current) {
              setImagesLoaded(true);
            }
          })
          .catch(() => {
            if (isMounted.current) {
              setImagesLoaded(true); // Continuer même en cas d'erreur
            }
          });
      } else {
        // Image par défaut si aucune image n'est disponible
        const defaultUrl = getFallbackImageUrl(playground.id);
        setImageUrls([defaultUrl]);
        
        const img = new Image();
        img.onload = () => {
          if (isMounted.current) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          if (isMounted.current) {
            setImagesLoaded(true); // Continuer même en cas d'erreur
          }
        };
        img.src = defaultUrl;
      }
    }
  }, [playground]);

  if (!playground) return null;

  const handleGetDirections = () => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${playground.latitude},${playground.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={!!playground} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>{playground.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="relative h-64 sm:h-80 bg-gray-200 rounded-lg">
            {imagesLoaded ? (
              <Carousel 
                images={imageUrls} 
                fallbackImage={getFallbackImageUrl(playground.id)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold">{playground.name}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapIcon className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{playground.address}, {playground.city}</span>
            </p>
          </div>

          <PlaygroundFeatures features={playground.features} />
          <PlaygroundDescription description={playground.description} />

          {userLocation && (
            <Button 
              className="w-full"
              onClick={handleGetDirections}
            >
              <NavigationIcon className="h-4 w-4 mr-2" />
              S'y rendre
            </Button>
          )}

          <CommentSection playgroundId={playground.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}