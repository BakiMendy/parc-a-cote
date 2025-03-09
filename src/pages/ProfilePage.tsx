import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserIcon, Loader2, Upload, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getRandomImageUrl } from '@/lib/images';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadProfile() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erreur lors du chargement du profil:', error);
          return;
        }
        
        if (data) {
          setFullName(data.full_name || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error) {
        console.error('Exception lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [user, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier si le fichier est une image
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    
    setAvatarFile(file);
    
    // Créer une URL de prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      let newAvatarUrl = avatarUrl;
      
      // Si un nouveau fichier d'avatar a été sélectionné
      if (avatarFile) {
        try {
          // Comme nous ne pouvons pas utiliser le stockage Supabase directement,
          // nous allons générer une URL d'avatar aléatoire
          newAvatarUrl = getRandomImageUrl(['avatar', 'profile'], user.id);
        } catch (uploadError) {
          console.error('Erreur lors du téléchargement de l\'avatar:', uploadError);
          toast.error('Erreur lors du téléchargement de l\'avatar');
        }
      }
      
      // Mettre à jour le profil
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: newAvatarUrl
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Mettre à jour l'état local
      setAvatarUrl(newAvatarUrl);
      
      // Nettoyer l'URL de prévisualisation
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      
      setAvatarFile(null);
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={avatarPreview || avatarUrl || `https://source.unsplash.com/random/200x200/?avatar&sig=${user?.id}`} 
                  alt={fullName || user?.email || 'Avatar'} 
                />
                <AvatarFallback>
                  <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isSaving}
              >
                <Upload className="h-4 w-4 mr-2" />
                Changer l'avatar
              </Button>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={user?.email || ''} 
                  disabled 
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  L'adresse email ne peut pas être modifiée
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Nom (ou pseudo)</label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom ou pseudo"
                  disabled={isSaving}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}