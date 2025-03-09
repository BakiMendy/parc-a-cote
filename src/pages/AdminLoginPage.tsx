import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LockIcon, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, checkIsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use useEffect to handle navigation after render
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les identifiants administrateur
    if (username !== 'BakiMendy' || password !== 'Eyeshield21') {
      toast.error('Identifiants administrateur incorrects');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simuler une connexion réussie
      localStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminLogin', 'true');
      
      toast.success('Connexion administrateur réussie');
      
      // Rediriger vers la page d'administration après un court délai
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (error) {
      console.error('Erreur de connexion admin:', error);
      toast.error('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-accent/20">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <LockIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center">
              Connexion Administrateur
            </h2>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Identifiant administrateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Connexion administrateur'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}