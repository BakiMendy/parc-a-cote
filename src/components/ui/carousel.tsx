import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getFallbackImageUrl } from '@/lib/images';

interface CarouselProps {
  images: string[];
  fallbackImage?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function Carousel({ 
  images, 
  fallbackImage = 'https://source.unsplash.com/random/800x600/?playground',
  autoPlay = true,
  interval = 5000
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMounted = useRef(true);
  
  // Seuil minimum pour considérer un swipe (en pixels)
  const minSwipeDistance = 50;

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialiser le tableau des images chargées
  useEffect(() => {
    setLoadedImages(new Array(images.length).fill(false));
  }, [images]);

  // Gérer le défilement automatique
  useEffect(() => {
    if (!autoPlay || isHovering || images.length <= 1) return;
    
    const timer = setInterval(() => {
      if (isMounted.current) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length, isHovering]);

  // Précharger les images
  useEffect(() => {
    const imagePromises = images.map((src, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (isMounted.current) {
            setLoadedImages(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
          resolve();
        };
        img.onerror = () => {
          if (isMounted.current) {
            // En cas d'erreur, marquer comme chargée mais utiliser l'image de secours
            setLoadedImages(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
          resolve();
        };
        img.src = src;
      });
    });
    
    // Précharger les images en parallèle
    Promise.all(imagePromises).catch(() => {
      // Continuer même en cas d'erreur
    });
  }, [images]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    e.currentTarget.src = fallbackImage || getFallbackImageUrl(`carousel-${index}`);
  };

  // Gestion des événements tactiles
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        <img 
          src={fallbackImage} 
          alt="Image par défaut" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getFallbackImageUrl('carousel-default');
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out">
        {images.map((src, index) => (
          <div 
            key={index}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {loadedImages[index] ? (
              <img
                src={src}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, index)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 z-10"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 z-10"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "bg-white w-4" 
                    : "bg-white/50 hover:bg-white/80"
                )}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Voir l'image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}