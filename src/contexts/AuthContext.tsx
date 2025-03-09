import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  checkIsAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  checkIsAdmin: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if a user is an admin
  async function checkIsAdmin() {
    if (!user || !user.id) return false;
    
    try {
      console.log("Checking admin status for user:", user.email);
      
      // Si l'email est admin@parcacote.fr, c'est l'administrateur
      if (user.email === 'admin@parcacote.fr') {
        console.log("Admin user detected by email");
        return true;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        return false;
      }

      console.log("Admin check result:", data);
      
      return data?.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      return false;
    }
  }

  useEffect(() => {
    // Vérifier l'utilisateur actuel au chargement
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const { user: currentUser } = await getCurrentUser();
        
        if (currentUser) {
          console.log("User authenticated:", currentUser.email);
          setUser(currentUser);
          
          // Check admin status
          const isUserAdmin = await checkIsAdmin();
          console.log("Is admin:", isUserAdmin);
          setIsAdmin(isUserAdmin);
        } else {
          console.log("No authenticated user");
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        toast.error('Erreur lors du chargement de l\'utilisateur');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Configurer l'écouteur d'événements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          const isUserAdmin = await checkIsAdmin();
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, checkIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}