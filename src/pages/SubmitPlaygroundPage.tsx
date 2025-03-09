import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LocationPicker } from '@/components/location/LocationPicker';
import { EquipmentSection } from '@/components/playground/EquipmentSection';
import { X, Loader2, AlertCircle, ImageIcon, Camera } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { submitPlayground, uploadPlaygroundImage } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getRandomImageUrl } from '@/lib/images';

interface PhotoWithName {
  file: File;
  name: string;
  previewUrl: string; // URL pour la prévisualisation
}

const formSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  address: z.string().min(5, 'L\'adresse est requise'),
  ageRange: z.string().min(2, 'La tranche d\'âge est requise'),
  equipments: z.array(z.string()).min(1, 'Sélectionnez au moins un équipement'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type FormValues = z.infer<typeof formSchema>;

export function SubmitPlaygroundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoWithName[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      ageRange: '3-12 ans',
      equipments: [],
      latitude: 0,
      longitude: 0,
    },
  });

  // Nettoyer les URLs de prévisualisation lors du démontage du composant
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });
      
      // Arrêter le flux vidéo si actif
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [photos, stream]);

  const handleEquipmentToggle = (id: string) => {
    const current = form.getValues('equipments');
    const updated = current.includes(id)
      ? current.filter(eq => eq !== id)
      : [...current, id];
    form.setValue('equipments', updated, { shouldValidate: true });
  };

  const handlePhotoAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos autorisées');
      return;
    }

    const newPhotos = files.map(file => {
      // Vérifier si le fichier est une image
      if (!file.type.startsWith('image/')) {
        toast.error(`Le fichier "${file.name}" n'est pas une image valide`);
        return null;
      }
      
      // Créer une URL de prévisualisation pour chaque fichier
      const previewUrl = URL.createObjectURL(file);
      return {
        file,
        name: file.name.split('.')[0], // Utilise le nom du fichier par défaut
        previewUrl
      };
    }).filter(Boolean) as PhotoWithName[];
    
    if (newPhotos.length > 0) {
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handlePhotoNameChange = (index: number, newName: string) => {
    setPhotos(current => 
      current.map((photo, i) => 
        i === index ? { ...photo, name: newName } : photo
      )
    );
  };

  const handlePhotoRemove = (index: number) => {
    // Libérer l'URL de prévisualisation pour éviter les fuites de mémoire
    if (photos[index].previewUrl) {
      URL.revokeObjectURL(photos[index].previewUrl);
    }
    setPhotos(current => current.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      
      if (!user) {
        toast.error('Vous devez être connecté pour soumettre un parc');
        navigate('/login');
        return;
      }

      setIsSubmitting(true);
      
      console.log("Submitting playground with values:", values);

      // 1. Créer le parc dans la base de données
      const playgroundData = {
        name: values.name,
        description: values.description,
        address: values.address,
        city: city || 'Non spécifiée',
        postal_code: postalCode || '00000',
        latitude: values.latitude,
        longitude: values.longitude,
        age_range: values.ageRange,
        submitted_by: user.id
      };
      
      console.log("Creating playground:", playgroundData);
      
      const { data: newPlayground, error: playgroundError } = await submitPlayground(playgroundData);

      if (playgroundError) {
        setError(`Erreur lors de la création du parc: ${playgroundError.message || 'Erreur inconnue'}`);
        throw new Error(playgroundError.message || 'Erreur lors de la création du parc');
      }

      if (!newPlayground || newPlayground.length === 0) {
        setError('Aucune donnée retournée lors de la création du parc');
        throw new Error('Aucune donnée retournée lors de la création du parc');
      }

      const playgroundId = newPlayground[0].id;
      console.log("Playground created with ID:", playgroundId);

      // 2. Télécharger les photos
      const uploadedImages = [];
      
      // Si aucune photo n'a été sélectionnée, ajouter des images par défaut
      if (photos.length === 0) {
        const defaultImageUrls = [
          getRandomImageUrl(['playground', 'park'], `${playgroundId}-1`),
          getRandomImageUrl(['playground', 'children'], `${playgroundId}-2`)
        ];
        
        for (let i = 0; i < defaultImageUrls.length; i++) {
          const imageData = {
            playground_id: playgroundId,
            url: defaultImageUrls[i],
            name: `Image par défaut ${i+1}`
          };
          
          try {
            await submitPlayground(imageData);
            uploadedImages.push(imageData);
          } catch (error) {
            console.error(`Erreur lors de l'ajout de l'image par défaut ${i+1}:`, error);
          }
        }
      } else {
        // Télécharger les photos sélectionnées par l'utilisateur
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const fileExt = photo.file.name.split('.').pop();
          const filePath = `${playgroundId}/${Date.now()}-${i}.${fileExt}`;
          
          console.log(`Uploading photo ${i+1}/${photos.length}: ${filePath}`);
          
          try {
            const { data: uploadData, error: uploadError } = await uploadPlaygroundImage(
              photo.file, 
              filePath
            );

            if (uploadError) {
              console.error(`Erreur lors du téléchargement de l'image ${i+1}:`, uploadError);
              // Utiliser une image de secours
              const fallbackUrl = getRandomImageUrl(['playground', 'park', 'children'], `${playgroundId}-${i}`);
              
              const imageData = {
                playground_id: playgroundId,
                url: fallbackUrl,
                name: photo.name || `Image ${i+1}`
              };
              
              const { error: imageError } = await submitPlayground(imageData);
              if (!imageError) {
                uploadedImages.push(imageData);
              }
              continue;
            }

            if (!uploadData || !uploadData.publicUrl) {
              console.error(`Pas d'URL retournée pour l'image ${i+1}`);
              continue;
            }

            // Ajouter l'image à la table playground_images
            const imageData = {
              playground_id: playgroundId,
              url: uploadData.publicUrl,
              name: photo.name || `Image ${i+1}`
            };
            
            console.log(`Adding image to database:`, imageData);
            
            const { error: imageError } = await submitPlayground(imageData);

            if (imageError) {
              console.error(`Erreur lors de l'enregistrement de l'image ${i+1}:`, imageError);
              continue;
            }
            
            uploadedImages.push(imageData);
            
          } catch (uploadException) {
            console.error(`Exception lors du téléchargement de l'image ${i+1}:`, uploadException);
            continue;
          }
        }
      }

      // Vérifier si au moins une image a été téléchargée avec succès
      if (uploadedImages.length === 0) {
        console.warn("Aucune image n'a pu être téléchargée, utilisation d'images par défaut");
        
        // Ajouter une image par défaut
        const defaultImageData = {
          playground_id: playgroundId,
          url: getRandomImageUrl('playground', `${playgroundId}-default`),
          name: "Image par défaut"
        };
        
        try {
          await submitPlayground(defaultImageData);
        } catch (error) {
          console.error("Erreur lors de l'ajout de l'image par défaut:", error);
        }
      }

      // 3. Ajouter les équipements
      for (const equipmentId of values.equipments) {
        console.log(`Adding equipment ${equipmentId} to playground ${playgroundId}`);
        
        const equipmentData = {
          playground_id: playgroundId,
          equipment_id: equipmentId
        };
        
        try {
          const { error: equipmentError } = await submitPlayground(equipmentData);

          if (equipmentError) {
            console.error(`Erreur lors de l'ajout de l'équipement ${equipmentId}:`, equipmentError);
            // Continuer avec les autres équipements même si celui-ci échoue
          }
        } catch (error) {
          console.error(`Exception lors de l'ajout de l'équipement ${equipmentId}:`, error);
        }
      }

      // Nettoyer les URLs de prévisualisation
      photos.forEach(photo => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });

      toast.success('Parc soumis avec succès ! Il sera visible après validation.');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Une erreur est survenue lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    form.setValue('latitude', location.lat, { shouldValidate: true });
    form.setValue('longitude', location.lng, { shouldValidate: true });
    form.setValue('address', location.address, { shouldValidate: true });
    
    // Essayer d'extraire la ville et le code postal de l'adresse
    const addressParts = location.address.split(',');
    if (addressParts.length >= 2) {
      // Le format typique est "Rue, Code Postal Ville, Pays"
      const cityPostalPart = addressParts[1].trim();
      const match = cityPostalPart.match(/(\d{5})\s+(.+)/);
      
      if (match) {
        const [, extractedPostalCode, extractedCity] = match;
        setPostalCode(extractedPostalCode);
        setCity(extractedCity);
      }
    }
    
    setShowLocationPicker(false);
  };

  // Fonctions pour la caméra
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setShowCameraDialog(true);
    } catch (err) {
      console.error('Erreur lors de l\'accès à la caméra:', err);
      toast.error('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraDialog(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Définir les dimensions du canvas pour correspondre à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image de la vidéo sur le canvas
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir le canvas en blob
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Erreur lors de la capture de la photo');
        return;
      }
      
      // Créer un fichier à partir du blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Créer une URL de prévisualisation
      const previewUrl = URL.createObjectURL(blob);
      
      // Ajouter la photo à la liste
      const newPhoto: PhotoWithName = {
        file,
        name: `Photo ${photos.length + 1}`,
        previewUrl
      };
      
      setPhotos(current => [...current, newPhoto]);
      
      // Fermer la caméra
      stopCamera();
      
      toast.success('Photo capturée avec succès');
    }, 'image/jpeg', 0.9);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez être connecté pour soumettre un parc.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/login')} className="w-full btn-playful">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Ajouter un nouveau parc</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du parc</FormLabel>
                  <FormControl>
                    <Input placeholder="Parc des enfants" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez le parc et ses équipements..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tranche d'âge recommandée</FormLabel>
                  <FormControl>
                    <Input placeholder="3-12 ans" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Localisation</FormLabel>
              {showLocationPicker ? (
                <LocationPicker onLocationSelect={handleLocationSelect} />
              ) : (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Adresse complète" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowLocationPicker(true)}
                  >
                    Sélectionner l'emplacement sur la carte
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <FormLabel>Équipements disponibles</FormLabel>
              <FormField
                control={form.control}
                name="equipments"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <EquipmentSection
                        selectedEquipments={form.watch('equipments')}
                        onEquipmentToggle={handleEquipmentToggle}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Photos</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="flex-1"
                    disabled={photos.length >= 5 || isSubmitting}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Sélectionner des photos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startCamera}
                    className="flex-1"
                    disabled={photos.length >= 5 || isSubmitting}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Prendre une photo
                  </Button>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoAdd}
                    disabled={photos.length >= 5 || isSubmitting}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des photos du parc (max 5 photos)
                </p>

                {/* Liste des photos avec leurs noms */}
                <div className="space-y-3">
                  {photos.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <p>Aucune photo sélectionnée</p>
                      <p className="text-xs mt-1">Les photos aident les autres utilisateurs à identifier le parc</p>
                    </div>
                  ) : (
                    photos.map((photo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="w-16 h-16 relative">
                          <img
                            src={photo.previewUrl}
                            alt={photo.name}
                            className="w-full h-full object-cover rounded-md"
                            onError={() => {
                              // En cas d'erreur, remplacer par une image par défaut
                              const img = document.createElement('img');
                              img.src = 'https://source.unsplash.com/random/800x600/?playground';
                              img.onload = () => {
                                const elements = document.querySelectorAll(`img[alt="${photo.name}"]`);
                                elements.forEach(el => {
                                  (el as HTMLImageElement).src = img.src;
                                });
                              };
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={photo.name}
                            onChange={(e) => handlePhotoNameChange(index, e.target.value)}
                            placeholder="Nom de la photo"
                            className="mb-1"
                            disabled={isSubmitting}
                          />
                          <p className="text-sm text-muted-foreground truncate">
                            {photo.file.name}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePhotoRemove(index)}
                          className="text-destructive hover:text-destructive/90"
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w 4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-playful"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                'Soumettre le parc'
              )}
            </Button>
          </form>
        </Form>

        {/* Dialog pour la caméra */}
        <Dialog open={showCameraDialog} onOpenChange={(open) => {
          if (!open) stopCamera();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Prendre une photo</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={stopCamera}
                className="sm:flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                onClick={capturePhoto}
                className="sm:flex-1 btn-playful"
              >
                Capturer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}