import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserIcon, LockIcon, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('user');

  // Use useEffect to handle navigation after render
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        toast.success('Connexion réussie');
        navigate('/submit');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur lors de la connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les identifiants administrateur
    if (adminIdentifier !== 'BakiMendy' || adminPassword !== 'Eyeshield21') {
      toast.error('Identifiants administrateur incorrects');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simuler une connexion réussie
      localStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminLogin', 'true');
      
      toast.success('Connexion administrateur réussie');
      
      // Rediriger vers la page d'administration
      navigate('/admin');
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
          <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="user">Utilisateur</TabsTrigger>
              <TabsTrigger value="admin">Administrateur</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user" className="space-y-6">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-secondary/10">
                  <UserIcon className="h-6 w-6 text-secondary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center">
                Connexion Utilisateur
              </h2>
              
              <form onSubmit={handleUserLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="w-full btn-playful"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Pas encore de compte ?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal"
                    onClick={() => navigate('/register')}
                    disabled={isLoading}
                  >
                    Créer un compte
                  </Button>
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-6">
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
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                />
                
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}