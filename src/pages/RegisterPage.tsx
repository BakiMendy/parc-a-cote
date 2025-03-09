import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserPlusIcon } from 'lucide-react';
import { signUp } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use useEffect to handle navigation after render
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await signUp(email, password);
      
      if (error) {
        throw error;
      }
      
      toast.success('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      toast.error('Erreur lors de la création du compte. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-accent/20">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-secondary/10">
              <UserPlusIcon className="h-6 w-6 text-secondary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">
            Créer un compte utilisateur
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-playful"
              disabled={isLoading}
            >
              {isLoading ? 'Création en cours...' : 'Créer un compte'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Se connecter
              </Button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}