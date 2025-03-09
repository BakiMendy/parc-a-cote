import { MapIcon, LogOutIcon, Menu, X, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationsPanel } from '@/components/admin/NotificationsPanel';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const isAdminPage = location.pathname === '/admin';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin via localStorage
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdminUser(true);
    } else {
      setIsAdminUser(isAdmin);
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      // Supprimer le statut admin du localStorage
      localStorage.removeItem('isAdmin');
      sessionStorage.removeItem('adminLogin');
      
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer transform hover:scale-105 transition-transform" 
          onClick={() => navigate('/')}
        >
          <MapIcon className="h-8 w-8 text-secondary" />
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            Parc à côté
          </span>
        </div>
        
        {/* Menu pour desktop */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/map')} 
                className="hover:bg-secondary/10 hover:text-secondary">
            Carte
          </Button>
          <Button variant="ghost" onClick={() => navigate('/playgrounds')}
                className="hover:bg-secondary/10 hover:text-secondary">
            Parcs
          </Button>
          <Button className="btn-playful" onClick={() => navigate('/submit')}>
            Ajouter un parc
          </Button>
          
          {isAdminUser && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="hover:bg-primary/10 hover:text-primary"
            >
              Admin
            </Button>
          )}
          
          {user ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/profile')}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Connexion
            </Button>
          )}
          
          {isAdminPage && isAdminUser && <NotificationsPanel />}
        </nav>

        {/* Bouton menu mobile */}
        <div className="md:hidden flex items-center">
          {isAdminPage && isAdminUser && <NotificationsPanel />}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 shadow-md">
          <div className="flex flex-col space-y-3">
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/map')}
              className="justify-start hover:bg-secondary/10 hover:text-secondary"
            >
              Carte
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/playgrounds')}
              className="justify-start hover:bg-secondary/10 hover:text-secondary"
            >
              Parcs
            </Button>
            <Button 
              className="btn-playful justify-start" 
              onClick={() => handleNavigation('/submit')}
            >
              Ajouter un parc
            </Button>
            
            {isAdminUser && (
              <Button 
                variant="ghost" 
                onClick={() => handleNavigation('/admin')}
                className="justify-start hover:bg-primary/10 hover:text-primary"
              >
                Admin
              </Button>
            )}
            
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/profile')}
                  className="justify-start hover:bg-primary/10 hover:text-primary"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profil
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="justify-start"
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => handleNavigation('/login')}
                className="justify-start"
              >
                Connexion
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}