import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { MapPage } from '@/pages/MapPage';
import { PlaygroundsPage } from '@/pages/PlaygroundsPage';
import { SubmitPlaygroundPage } from '@/pages/SubmitPlaygroundPage';
import { AdminPage } from '@/pages/AdminPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// Route protégée pour les utilisateurs connectés
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

// Route protégée pour les administrateurs
// Modifiée pour fonctionner avec la simulation d'admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est admin via localStorage
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdminUser(true);
    } else {
      setIsAdminUser(isAdmin);
    }
  }, [isAdmin]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Vérifier si l'utilisateur vient de la page de connexion admin
  const comingFromAdminLogin = sessionStorage.getItem('adminLogin') === 'true';
  
  if (comingFromAdminLogin || isAdminUser) {
    // Si l'utilisateur vient de se connecter en tant qu'admin, le laisser passer
    return <>{children}</>;
  }
  
  return <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/playgrounds" element={<PlaygroundsPage />} />
            <Route path="/submit" element={
              <ProtectedRoute>
                <SubmitPlaygroundPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;