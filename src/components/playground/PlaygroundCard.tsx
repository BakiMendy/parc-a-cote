import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPinIcon, Users2Icon, StarIcon } from 'lucide-react';
import { getValidImageUrl, getFallbackImageUrl } from '@/lib/images';
import type { Playground } from '@/types';
import { useState, useEffect, useRef } from 'react';

interface PlaygroundCardProps {
  playground: Playground;
  onClick?: () => void;
}

export function PlaygroundCard({ playground, onClick }: PlaygroundCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Nettoyer lors du démontage
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    // Réinitialiser l'état lors du changement de parc
    setImageLoaded(false);
    setImageError(false);
    
    // Générer une URL d'image valide
    const url = getValidImageUrl(playground.images);
    setImageUrl(url);
    
    // Précharger l'image
    const img = new Image();
    img.onload = () => {
      if (isMounted.current) {
        setImageLoaded(true);
      }
    };
    img.onerror = () => {
      if (isMounted.current) {
        // En cas d'erreur, utiliser l'image de secours
        setImageError(true);
        setImageUrl(getFallbackImageUrl(playground.id));
        setImageLoaded(true);
      }
    };
    img.src = url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [playground.id, playground.images]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageUrl(getFallbackImageUrl(playground.id));
    }
  };

  return (
    <Card 
      className="playground-card hover:shadow-xl transition-all cursor-pointer bg-white border-2 border-accent/20 h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
        {imageLoaded ? (
          <img
            src={imageUrl}
            alt={playground.name}
            className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <CardHeader className="bg-gradient-to-b from-accent/10 to-transparent p-4">
        <CardTitle className="text-lg font-bold text-primary line-clamp-2">{playground.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinIcon className="h-4 w-4 mr-1 text-secondary flex-shrink-0" />
            <span className="truncate">{playground.city}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users2Icon className="h-4 w-4 mr-1 text-secondary flex-shrink-0" />
            <span>{playground.ageRange}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {playground.features && playground.features.length > 0 ? (
            playground.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} className="feature-badge">
                {feature}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Aucune caractéristique spécifiée</span>
          )}
          {playground.features && playground.features.length > 3 && (
            <Badge variant="outline">+{playground.features.length - 3}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}