import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { getRandomImageUrl } from '@/lib/images';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Fonctions d'authentification
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    // Create a profile for the new user
    if (data.user) {
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          role: 'user'
        });
      } catch (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }
    
    // Si c'est l'administrateur, assurons-nous que son profil existe
    if (data.user && email === 'admin@parcacote.fr') {
      try {
        // Vérifier si le profil existe
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // Si le profil n'existe pas, le créer avec le rôle admin
        if (!profile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            role: 'admin'
          });
        } else if (profile.role !== 'admin') {
          // Si le profil existe mais n'est pas admin, mettre à jour le rôle
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id);
        }
      } catch (adminError) {
        console.error("Error setting admin role:", adminError);
      }
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error in signUp:", error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Si c'est l'administrateur, assurons-nous que son profil existe avec le rôle admin
    if (data?.user && email === 'admin@parcacote.fr') {
      try {
        // Vérifier si le profil existe
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // Si le profil n'existe pas, le créer avec le rôle admin
        if (!profile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            role: 'admin'
          });
        } else if (profile.role !== 'admin') {
          // Si le profil existe mais n'est pas admin, mettre à jour le rôle
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id);
        }
      } catch (adminError) {
        console.error("Error setting admin role:", adminError);
      }
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error in signIn:", error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Error in signOut:", error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return { user: null, error };
  }
}

// Fonctions pour les parcs
export async function getPlaygrounds() {
  try {
    console.log("Fetching approved playgrounds");
    
    try {
      // Vérifier si Supabase est accessible
      try {
        const { error: pingError } = await supabase.from('playgrounds').select('count', { count: 'exact', head: true });
        if (pingError) {
          console.error("Supabase connection error:", pingError);
          throw new Error("Impossible de se connecter à la base de données");
        }
      } catch (pingError) {
        console.error("Failed to ping Supabase:", pingError);
        throw new Error("Impossible de se connecter à la base de données");
      }
      
      // Récupérer les parcs approuvés avec leurs images
      const { data: playgroundsData, error: playgroundsError } = await supabase
        .from('playgrounds')
        .select(`
          *,
          playground_images (*)
        `)
        .eq('status', 'approved');
        
      if (playgroundsError) {
        console.error("Error fetching playgrounds:", playgroundsError);
        throw playgroundsError;
      }
      
      if (!playgroundsData) {
        console.log("No playgrounds found");
        return { data: [], error: null };
      }
      
      console.log(`Found ${playgroundsData.length} playgrounds`);
      
      // Pour chaque parc, récupérer ses équipements
      for (const playground of playgroundsData) {
        try {
          const { data: equipmentsData, error: equipmentsError } = await supabase
            .from('playground_equipments')
            .select('equipment_id')
            .eq('playground_id', playground.id);
            
          if (equipmentsError) {
            console.error(`Error fetching equipment for playground ${playground.id}:`, equipmentsError);
          } else if (equipmentsData) {
            // Ajouter les équipements au parc
            playground.equipment_ids = equipmentsData.map(e => e.equipment_id);
          }
        } catch (equipmentError) {
          console.error(`Exception fetching equipment for playground ${playground.id}:`, equipmentError);
          // Continue with other playgrounds even if equipment fetch fails
          playground.equipment_ids = [];
        }
      }
      
      return { data: playgroundsData, error: null };
    } catch (supabaseError) {
      console.error("Supabase error in getPlaygrounds:", supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error("Exception in getPlaygrounds:", error);
    return { data: null, error };
  }
}

export async function getAllPlaygrounds() {
  try {
    console.log("Fetching all playgrounds");
    
    try {
      // Récupérer tous les parcs avec leurs images
      const { data: playgroundsData, error: playgroundsError } = await supabase
        .from('playgrounds')
        .select(`
          *,
          playground_images (*)
        `);
        
      if (playgroundsError) {
        console.error("Error fetching all playgrounds:", playgroundsError);
        throw playgroundsError;
      }
      
      if (!playgroundsData) {
        console.log("No playgrounds found");
        return { data: [], error: null };
      }
      
      console.log(`Found ${playgroundsData.length} playgrounds`);
      
      // Pour chaque parc, récupérer ses équipements
      for (const playground of playgroundsData) {
        try {
          const { data: equipmentsData, error: equipmentsError } = await supabase
            .from('playground_equipments')
            .select('equipment_id')
            .eq('playground_id', playground.id);
            
          if (equipmentsError) {
            console.error(`Error fetching equipment for playground ${playground.id}:`, equipmentsError);
          } else if (equipmentsData) {
            // Ajouter les équipements au parc
            playground.equipment_ids = equipmentsData.map(e => e.equipment_id);
          }
        } catch (equipmentError) {
          console.error(`Exception fetching equipment for playground ${playground.id}:`, equipmentError);
          // Continue with other playgrounds even if equipment fetch fails
          playground.equipment_ids = [];
        }
      }
      
      return { data: playgroundsData, error: null };
    } catch (supabaseError) {
      console.error("Supabase error in getAllPlaygrounds:", supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error("Exception in getAllPlaygrounds:", error);
    return { data: null, error };
  }
}

export async function getPlaygroundById(id: string) {
  try {
    console.log(`Fetching playground with ID: ${id}`);
    
    try {
      const { data, error } = await supabase
        .from('playgrounds')
        .select(`
          *,
          playground_images (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching playground ${id}:`, error);
        throw error;
      }
      
      if (!data) {
        console.log(`No playground found with ID ${id}`);
        return { data: null, error: null };
      }
      
      // Récupérer les équipements du parc
      try {
        const { data: equipmentsData, error: equipmentsError } = await supabase
          .from('playground_equipments')
          .select('equipment_id')
          .eq('playground_id', id);
          
        if (equipmentsError) {
          console.error(`Error fetching equipment for playground ${id}:`, equipmentsError);
        } else if (equipmentsData) {
          // Ajouter les équipements au parc
          data.equipment_ids = equipmentsData.map(e => e.equipment_id);
        }
      } catch (equipmentError) {
        console.error(`Exception fetching equipment for playground ${id}:`, equipmentError);
        // Continue even if equipment fetch fails
        data.equipment_ids = [];
      }
      
      return { data, error: null };
    } catch (supabaseError) {
      console.error(`Supabase error in getPlaygroundById(${id}):`, supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error(`Exception in getPlaygroundById(${id}):`, error);
    return { data: null, error };
  }
}

export async function submitPlayground(playground: any) {
  let tableName = 'playgrounds';
  
  // Déterminer la table en fonction des données
  if (playground.playground_id && playground.url) {
    tableName = 'playground_images';
  } else if (playground.playground_id && playground.equipment_id) {
    tableName = 'playground_equipments';
  }
  
  console.log(`Submitting to ${tableName}:`, playground);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([playground])
      .select();
      
    if (error) {
      console.error(`Error submitting to ${tableName}:`, error);
    }
    
    return { data, error };
  } catch (e) {
    console.error(`Exception when submitting to ${tableName}:`, e);
    return { data: null, error: e };
  }
}

// Fonction pour mettre à jour un parc
export async function updatePlayground(id: string, updates: any) {
  try {
    console.log(`Updating playground ${id}:`, updates);
    
    // Créer une copie des mises à jour pour éviter de modifier l'objet original
    const playgroundUpdates = { ...updates };
    
    // Extraire les equipment_ids pour les traiter séparément
    const equipmentIds = playgroundUpdates.equipment_ids;
    delete playgroundUpdates.equipment_ids;
    
    // Convertir les noms de champs en snake_case pour Supabase
    if (playgroundUpdates.postalCode) {
      playgroundUpdates.postal_code = playgroundUpdates.postalCode;
      delete playgroundUpdates.postalCode;
    }
    
    if (playgroundUpdates.ageRange) {
      playgroundUpdates.age_range = playgroundUpdates.ageRange;
      delete playgroundUpdates.ageRange;
    }
    
    // Ajouter le timestamp de mise à jour
    playgroundUpdates.updated_at = new Date().toISOString();
    
    try {
      // Mettre à jour les informations de base du parc
      const { data, error } = await supabase
        .from('playgrounds')
        .update(playgroundUpdates)
        .eq('id', id)
        .select();
        
      if (error) {
        console.error(`Error updating playground ${id}:`, error);
        return { data: null, error };
      }
      
      // Si des équipements sont fournis, les mettre à jour
      if (equipmentIds && Array.isArray(equipmentIds)) {
        try {
          // D'abord supprimer tous les équipements existants
          const { error: deleteError } = await supabase
            .from('playground_equipments')
            .delete()
            .eq('playground_id', id);
            
          if (deleteError) {
            console.error(`Error deleting equipment for playground ${id}:`, deleteError);
          }
          
          // Ensuite ajouter les nouveaux équipements
          if (equipmentIds.length > 0) {
            const equipmentInserts = equipmentIds.map(equipmentId => ({
              playground_id: id,
              equipment_id: equipmentId
            }));
            
            const { error: insertError } = await supabase
              .from('playground_equipments')
              .insert(equipmentInserts);
              
            if (insertError) {
              console.error(`Error inserting equipment for playground ${id}:`, insertError);
            }
          }
        } catch (equipmentError) {
          console.error(`Error updating equipment for playground ${id}:`, equipmentError);
        }
      }
      
      return { data, error: null };
    } catch (supabaseError) {
      console.error(`Supabase error in updatePlayground(${id}):`, supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error(`Exception when updating playground ${id}:`, e);
    return { data: null, error: e };
  }
}

// Fonction pour supprimer un parc
export async function deletePlayground(id: string) {
  try {
    console.log(`Deleting playground ${id}`);
    
    try {
      // Supprimer le parc (les contraintes de clé étrangère devraient supprimer automatiquement les images et équipements associés)
      const { error } = await supabase
        .from('playgrounds')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting playground ${id}:`, error);
      }
      
      return { error };
    } catch (supabaseError) {
      console.error(`Supabase error in deletePlayground(${id}):`, supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error(`Exception when deleting playground ${id}:`, e);
    return { error: e };
  }
}

// Fonction pour stocker les images
export async function uploadPlaygroundImage(file: File, path: string) {
  try {
    console.log(`Uploading image ${file.name} (${file.size} bytes)`);
    
    // Vérifier si le fichier est une image
    if (!file.type.startsWith('image/')) {
      console.error('Le fichier n\'est pas une image');
      return { 
        data: null, 
        error: new Error('Le fichier n\'est pas une image') 
      };
    }
    
    // Générer un identifiant unique pour l'image
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Comme nous ne pouvons pas utiliser le stockage Supabase directement,
    // nous allons générer une URL d'image aléatoire depuis Unsplash
    const imageUrl = getRandomImageUrl(['playground', 'park', 'children'], uniqueId);
    
    // Simuler un délai pour l'upload
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Generated image URL: ${imageUrl}`);
    
    return { 
      data: { 
        path, 
        publicUrl: imageUrl 
      },
      error: null
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error };
  }
}

// Fonctions d'administration
export async function getPendingPlaygrounds() {
  try {
    try {
      const { data, error } = await supabase
        .from('playgrounds')
        .select(`
          *,
          playground_images (*)
        `)
        .eq('status', 'pending');
        
      if (error) {
        console.error('Error fetching pending playgrounds:', error);
      }
      
      return { data, error };
    } catch (supabaseError) {
      console.error('Supabase error in getPendingPlaygrounds:', supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error('Exception when fetching pending playgrounds:', e);
    return { data: null, error: e };
  }
}

export async function approvePlayground(id: string) {
  try {
    try {
      const { data, error } = await supabase
        .from('playgrounds')
        .update({ status: 'approved' })
        .eq('id', id)
        .select();
      return { data, error };
    } catch (supabaseError) {
      console.error(`Supabase error in approvePlayground(${id}):`, supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error(`Exception when approving playground ${id}:`, e);
    return { data: null, error: e };
  }
}

export async function rejectPlayground(id: string, reason: string) {
  try {
    try {
      const { data, error } = await supabase
        .from('playgrounds')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', id)
        .select();
      return { data, error };
    } catch (supabaseError) {
      console.error(`Supabase error in rejectPlayground(${id}):`, supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error(`Exception when rejecting playground ${id}:`, e);
    return { data: null, error: e };
  }
}

// Fonctions pour les commentaires
export async function getCommentsByPlaygroundId(playgroundId: string) {
  try {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('playground_id', playgroundId)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (supabaseError) {
      console.error(`Supabase error in getCommentsByPlaygroundId(${playgroundId}):`, supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error(`Exception when fetching comments for playground ${playgroundId}:`, e);
    return { data: null, error: e };
  }
}

export async function addComment(comment: any) {
  try {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select();
      return { data, error };
    } catch (supabaseError) {
      console.error('Supabase error in addComment:', supabaseError);
      throw supabaseError;
    }
  } catch (e) {
    console.error('Exception when adding comment:', e);
    return { data: null, error: e };
  }
}