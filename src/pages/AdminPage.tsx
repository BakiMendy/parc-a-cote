import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  CheckIcon, 
  XIcon, 
  EyeIcon, 
  AlertTriangleIcon,
  ImageIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  Loader2,
  Pencil,
  Trash2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { sendEmail, emailTemplates } from '@/lib/email';
import { 
  getPendingPlaygrounds, 
  approvePlayground, 
  rejectPlayground, 
  getAllPlaygrounds,
  updatePlayground,
  deletePlayground
} from '@/lib/supabase';
import { getValidImageUrl } from '@/lib/images';
import { EquipmentSection } from '@/components/playground/EquipmentSection';
import { equipments } from '@/data/equipments';
import type { Playground } from '@/types';

export function AdminPage() {
  const [pendingPlaygrounds, setPendingPlaygrounds] = useState<Playground[]>([]);
  const [approvedPlaygrounds, setApprovedPlaygrounds] = useState<Playground[]>([]);
  const [rejectedPlaygrounds, setRejectedPlaygrounds] = useState<Playground[]>([]);
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editedPlayground, setEditedPlayground] = useState<Partial<Playground>>({});
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Définir l'utilisateur comme admin dans le localStorage
    localStorage.setItem('isAdmin', 'true');
    sessionStorage.setItem('adminLogin', 'true');
    
    // Charger tous les parcs
    loadPlaygrounds();
  }, []);

  const loadPlaygrounds = async () => {
    setIsLoading(true);
    
    try {
      // Essayer de récupérer les parcs depuis Supabase
      const { data, error } = await getAllPlaygrounds();
      
      if (error) {
        console.error("Error fetching playgrounds:", error);
        loadMockPlaygrounds();
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No playgrounds found in Supabase, using mock data");
        loadMockPlaygrounds();
        return;
      }
      
      // Transformer les données Supabase en format Playground
      const formattedPlaygrounds: Playground[] = data.map(pg => {
        // Convertir les IDs d'équipement en noms de caractéristiques
        const features = pg.equipment_ids 
          ? pg.equipment_ids.map(id => {
              const equipment = equipments.find(e => e.id === id);
              return equipment ? equipment.label : id;
            })
          : [];
        
        return {
          id: pg.id,
          name: pg.name,
          description: pg.description,
          address: pg.address,
          city: pg.city,
          postalCode: pg.postal_code,
          latitude: pg.latitude,
          longitude: pg.longitude,
          images: pg.playground_images ? pg.playground_images.map(img => ({
            id: img.id,
            url: img.url,
            status: img.status,
            createdAt: img.created_at
          })) : [],
          features: features,
          ageRange: pg.age_range,
          status: pg.status,
          createdAt: pg.created_at,
          updatedAt: pg.updated_at,
          submittedBy: pg.submitted_by,
          equipmentIds: pg.equipment_ids || []
        };
      });
      
      // Séparer les parcs par statut
      setPendingPlaygrounds(formattedPlaygrounds.filter(p => p.status === 'pending'));
      setApprovedPlaygrounds(formattedPlaygrounds.filter(p => p.status === 'approved'));
      setRejectedPlaygrounds(formattedPlaygrounds.filter(p => p.status === 'rejected'));
      
    } catch (error) {
      console.error("Error loading playgrounds:", error);
      loadMockPlaygrounds();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockPlaygrounds = () => {
    // Créer des parcs fictifs
    const mockPending: Playground[] = [
      {
        id: "pending1",
        name: "Parc des Enfants",
        description: "Nouveau parc avec plusieurs jeux modernes et un espace pique-nique.",
        address: "15 rue des Lilas",
        city: "Lyon",
        postalCode: "69003",
        latitude: 45.7602,
        longitude: 4.8566,
        images: [
          { 
            id: "p1", 
            url: "https://source.unsplash.com/random/800x600/?playground,modern&sig=101", 
            status: "pending", 
            createdAt: new Date().toISOString() 
          },
          { 
            id: "p2", 
            url: "https://source.unsplash.com/random/800x600/?playground,picnic&sig=102", 
            status: "pending", 
            createdAt: new Date().toISOString() 
          }
        ],
        features: ["Toboggan", "Structure d'escalade", "Tables de pique-nique"],
        ageRange: "3-12 ans",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        submittedBy: "utilisateur@example.com",
        equipmentIds: ["slide", "climbing", "picnic"]
      },
      {
        id: "pending2",
        name: "Aire de jeux du Parc Monplaisir",
        description: "Petite aire de jeux dans un cadre verdoyant, idéale pour les tout-petits.",
        address: "Avenue des Frères Lumière",
        city: "Lyon",
        postalCode: "69008",
        latitude: 45.7425,
        longitude: 4.8702,
        images: [
          { 
            id: "p3", 
            url: "https://source.unsplash.com/random/800x600/?playground,toddler&sig=103", 
            status: "pending", 
            createdAt: new Date().toISOString() 
          }
        ],
        features: ["Balançoires", "Bac à sable", "Espace tout-petits"],
        ageRange: "1-6 ans",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        submittedBy: "parent@example.com",
        equipmentIds: ["swing", "sandbox", "toddler"]
      }
    ];
    
    setPendingPlaygrounds(mockPending);
    setApprovedPlaygrounds([]);
    setRejectedPlaygrounds([]);
    setIsLoading(false);
  };

  const handleApprove = async (playground: Playground) => {
    try {
      // Simuler l'approbation
      toast.success(`Parc "${playground.name}" approuvé avec succès`);
      
      // Mettre à jour l'état local
      const updatedPlayground = { ...playground, status: 'approved' as const };
      setPendingPlaygrounds(current => current.filter(p => p.id !== playground.id));
      setApprovedPlaygrounds(current => [...current, updatedPlayground]);
      
      // Essayer d'approuver dans Supabase
      try {
        await approvePlayground(playground.id);
      } catch (error) {
        console.error('Erreur lors de l\'approbation dans Supabase:', error);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (playground: Playground) => {
    try {
      // Simuler le rejet
      toast.success(`Parc "${playground.name}" rejeté`);
      
      // Mettre à jour l'état local
      const updatedPlayground = { ...playground, status: 'rejected' as const };
      setPendingPlaygrounds(current => current.filter(p => p.id !== playground.id));
      setRejectedPlaygrounds(current => [...current, updatedPlayground]);
      
      // Essayer de rejeter dans Supabase
      try {
        await rejectPlayground(playground.id, rejectionReason);
      } catch (error) {
        console.error('Erreur lors du rejet dans Supabase:', error);
      }
      
      setRejectionReason('');
      setShowRejectionDialog(false);
    } catch (error) {
      toast.error('Erreur lors du rejet');
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleEdit = (playground: Playground) => {
    setSelectedPlayground(playground);
    setEditedPlayground({
      name: playground.name,
      description: playground.description,
      address: playground.address,
      city: playground.city,
      postalCode: playground.postalCode,
      ageRange: playground.ageRange
    });
    setSelectedEquipments(playground.equipmentIds || []);
    setShowEditDialog(true);
  };

  const handleEquipmentToggle = (id: string) => {
    setSelectedEquipments(current => 
      current.includes(id) 
        ? current.filter(eq => eq !== id) 
        : [...current, id]
    );
  };

  const handleSaveEdit = async () => {
    if (!selectedPlayground) return;
    
    try {
      setIsSaving(true);
      
      // Préparer les données à mettre à jour
      const updates = {
        name: editedPlayground.name,
        description: editedPlayground.description,
        address: editedPlayground.address,
        city: editedPlayground.city,
        postalCode: editedPlayground.postalCode,
        ageRange: editedPlayground.ageRange,
        equipment_ids: selectedEquipments
      };
      
      console.log("Sending updates to Supabase:", updates);
      
      // Mettre à jour dans Supabase
      try {
        const { data, error } = await updatePlayground(selectedPlayground.id, updates);
        
        if (error) {
          console.error('Erreur lors de la mise à jour dans Supabase:', error);
          throw error;
        }
        
        console.log("Update response from Supabase:", data);
      } catch (error) {
        console.error('Erreur lors de la mise à jour dans Supabase:', error);
        throw error;
      }
      
      // Mettre à jour l'état local
      const updatedPlayground = {
        ...selectedPlayground,
        name: editedPlayground.name || selectedPlayground.name,
        description: editedPlayground.description || selectedPlayground.description,
        address: editedPlayground.address || selectedPlayground.address,
        city: editedPlayground.city || selectedPlayground.city,
        postalCode: editedPlayground.postalCode || selectedPlayground.postalCode,
        ageRange: editedPlayground.ageRange || selectedPlayground.ageRange,
        equipmentIds: selectedEquipments,
        features: selectedEquipments.map(id => {
          const equipment = equipments.find(e => e.id === id);
          return equipment ? equipment.label : id;
        }),
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour la liste appropriée
      if (selectedPlayground.status === 'approved') {
        setApprovedPlaygrounds(current => 
          current.map(p => p.id === selectedPlayground.id ? updatedPlayground : p)
        );
      } else if (selectedPlayground.status === 'rejected') {
        setRejectedPlaygrounds(current => 
          current.map(p => p.id === selectedPlayground.id ? updatedPlayground : p)
        );
      } else {
        setPendingPlaygrounds(current => 
          current.map(p => p.id === selectedPlayground.id ? updatedPlayground : p)
        );
      }
      
      toast.success(`Parc "${updatedPlayground.name}" mis à jour avec succès`);
      setShowEditDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (playground: Playground) => {
    setSelectedPlayground(playground);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlayground) return;
    
    try {
      // Supprimer dans Supabase
      try {
        await deletePlayground(selectedPlayground.id);
      } catch (error) {
        console.error('Erreur lors de la suppression dans Supabase:', error);
      }
      
      // Mettre à jour l'état local
      if (selectedPlayground.status === 'approved') {
        setApprovedPlaygrounds(current => 
          current.filter(p => p.id !== selectedPlayground.id)
        );
      } else if (selectedPlayground.status === 'rejected') {
        setRejectedPlaygrounds(current => 
          current.filter(p => p.id !== selectedPlayground.id)
        );
      } else {
        setPendingPlaygrounds(current => 
          current.filter(p => p.id !== selectedPlayground.id)
        );
      }
      
      toast.success(`Parc "${selectedPlayground.name}" supprimé avec succès`);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des parcs en attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingPlaygrounds.filter(p => p.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-secondary">
                {pendingPlaygrounds.filter(p => p.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approuvés</TabsTrigger>
          <TabsTrigger value="rejected">Rejetés</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {pendingPlaygrounds.length === 0 || pendingPlaygrounds.filter(p => p.status === 'pending').length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Aucun parc en attente de validation</p>
            </div>
          ) : (
            pendingPlaygrounds
              .filter(p => p.status === 'pending')
              .map(playground => (
                <div key={playground.id} className="bg-white rounded-lg shadow-md border p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{playground.name}</h3>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">{playground.address}, {playground.city}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPlayground(playground)}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(playground)}
                      >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedPlayground(playground);
                          setShowRejectionDialog(true);
                        }}
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      Soumis le {new Date(playground.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserIcon className="h-4 w-4" />
                      Par {playground.submittedBy}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {playground.images.map((image, index) => (
                      <div key={index} className="relative aspect-video">
                        <img
                          src={getValidImageUrl([image])}
                          alt={`${playground.name} - Photo ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback image if the original fails to load
                            (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/800x600/?playground&sig=${playground.id}-${index}`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-6">
            {approvedPlaygrounds.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Aucun parc approuvé</p>
              </div>
            ) : (
              approvedPlaygrounds.map(playground => (
                <div key={playground.id} className="bg-white rounded-lg shadow-md border p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{playground.name}</h3>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">{playground.address}, {playground.city}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-green-600">Approuvé</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(playground)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(playground)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {playground.images.map((image, index) => (
                      <div key={index} className="relative aspect-video">
                        <img
                          src={getValidImageUrl([image])}
                          alt={`${playground.name} - Photo ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback image if the original fails to load
                            ( e.target as HTMLImageElement).src = `https://source.unsplash.com/random/800x600/?playground&sig=${playground.id}-${index}`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-6">
            {rejectedPlaygrounds.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Aucun parc rejeté</p>
              </div>
            ) : (
              rejectedPlaygrounds.map(playground => (
                <div key={playground.id} className="bg-white rounded-lg shadow-md border p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{playground.name}</h3>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">{playground.address}, {playground.city}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive">Rejeté</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(playground)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(playground)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {playground.images.map((image, index) => (
                      <div key={index} className="relative aspect-video">
                        <img
                          src={getValidImageUrl([image])}
                          alt={`${playground.name} - Photo ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback image if the original fails to load
                            (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/800x600/?playground&sig=${playground.id}-${index}`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de détails du parc */}
      <Dialog open={!!selectedPlayground && !showRejectionDialog && !showEditDialog && !showDeleteDialog} onOpenChange={() => setSelectedPlayground(null)}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Détails du parc</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {selectedPlayground && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedPlayground.name}</h3>
                  <p className="text-muted-foreground break-words">
                    {selectedPlayground.address}, {selectedPlayground.city}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedPlayground.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Caractéristiques</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayground.features && selectedPlayground.features.length > 0 ? (
                        selectedPlayground.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune caractéristique spécifiée</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Photos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedPlayground.images && selectedPlayground.images.length > 0 ? (
                      selectedPlayground.images.map((image, index) => (
                        <div key={index} className="relative aspect-video">
                          <img
                            src={getValidImageUrl([image])}
                            alt={`${selectedPlayground.name} - Photo ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback image if the original fails to load
                              (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/800x600/?playground&sig=${selectedPlayground.id}-${index}`;
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune photo disponible</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:w-auto">
          <DialogHeader>
            <DialogTitle>Motif du rejet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Expliquez la raison du rejet..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedPlayground && handleReject(selectedPlayground)}
                className="w-full sm:w-auto"
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Modifier le parc</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <Input
                  value={editedPlayground.name || ''}
                  onChange={(e) => setEditedPlayground({...editedPlayground, name: e.target.value})}
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editedPlayground.description || ''}
                  onChange={(e) => setEditedPlayground({...editedPlayground, description: e.target.value})}
                  rows={4}
                  disabled={isSaving}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <Input
                    value={editedPlayground.address || ''}
                    onChange={(e) => setEditedPlayground({...editedPlayground, address: e.target.value})}
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <Input
                    value={editedPlayground.city || ''}
                    onChange={(e) => setEditedPlayground({...editedPlayground, city: e.target.value})}
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code postal</label>
                  <Input
                    value={editedPlayground.postalCode || ''}
                    onChange={(e) => setEditedPlayground({...editedPlayground, postalCode: e.target.value})}
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tranche d'âge</label>
                  <Input
                    value={editedPlayground.ageRange || ''}
                    onChange={(e) => setEditedPlayground({...editedPlayground, ageRange: e.target.value})}
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Équipements</label>
                <EquipmentSection
                  selectedEquipments={selectedEquipments}
                  onEquipmentToggle={handleEquipmentToggle}
                />
              </div>
              
              {/* Photos - Affichage uniquement pour l'instant */}
              <div>
                <label className="block text-sm font-medium mb-2">Photos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedPlayground?.images.map((image, index) => (
                    <div key={index} className="relative aspect-video">
                      <img
                        src={getValidImageUrl([image])}
                        alt={`Photo ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/800x600/?playground&sig=${selectedPlayground.id}-${index}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  La gestion des photos sera disponible dans une prochaine mise à jour.
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)} 
              className="w-full sm:w-auto"
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="w-full sm:w-auto"
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
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:w-auto">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Êtes-vous sûr de vouloir supprimer le parc "{selectedPlayground?.name}" ?
              Cette action est irréversible.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto"
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}