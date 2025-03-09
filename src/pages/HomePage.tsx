import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapIcon, PlusCircleIcon, SearchIcon, LogInIcon, UserPlusIcon } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Trouvez les meilleurs parcs de jeux pour vos enfants
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground">
          Découvrez les aires de jeux près de chez vous et partagez vos découvertes avec la communauté.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 md:p-6 rounded-lg border bg-card text-card-foreground">
            <SearchIcon className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Recherchez</h3>
            <p className="text-sm text-muted-foreground">
              Trouvez facilement les parcs autour de vous
            </p>
          </div>
          
          <div className="p-4 md:p-6 rounded-lg border bg-card text-card-foreground">
            <MapIcon className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Explorez</h3>
            <p className="text-sm text-muted-foreground">
              Visualisez tous les parcs sur la carte
            </p>
          </div>
          
          <div className="p-4 md:p-6 rounded-lg border bg-card text-card-foreground sm:col-span-2 md:col-span-1">
            <PlusCircleIcon className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Contribuez</h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez de nouveaux parcs à la base
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/map')} className="btn-playful">
            <MapIcon className="h-4 w-4 mr-2" />
            Voir la carte
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/submit')} className="hover:bg-secondary/10">
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Ajouter un parc
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="hover:bg-primary/10"
          >
            <LogInIcon className="h-4 w-4 mr-2" />
            Se connecter
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/register')}
            className="hover:bg-primary/10"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Créer un compte
          </Button>
        </div>
      </div>
    </div>
  );
}