import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon, Loader2 } from 'lucide-react';
import { mockComments } from '@/data/mockComments';
import { getCommentsByPlaygroundId, addComment } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Comment } from '@/types';

interface CommentSectionProps {
  playgroundId: string;
}

export function CommentSection({ playgroundId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        
        // Essayer de récupérer les commentaires depuis Supabase
        try {
          const { data, error } = await getCommentsByPlaygroundId(playgroundId);
          
          if (error) {
            console.error("Error fetching comments:", error);
            throw error;
          }
          
          if (data && data.length > 0) {
            // Transformer les données de Supabase en format Comment
            const formattedComments: Comment[] = data.map(comment => ({
              id: comment.id,
              playgroundId: comment.playground_id,
              content: comment.content,
              rating: comment.rating,
              author: comment.author_name || "Utilisateur",
              createdAt: comment.created_at
            }));
            
            setComments(formattedComments);
          } else {
            // Si aucun commentaire n'est trouvé dans Supabase, utiliser les données fictives
            const mockData = mockComments.filter(c => c.playgroundId === playgroundId);
            setComments(mockData);
          }
        } catch (supabaseError) {
          console.error("Supabase error, falling back to mock comments:", supabaseError);
          
          // En cas d'erreur avec Supabase, utiliser les données fictives
          const mockData = mockComments.filter(c => c.playgroundId === playgroundId);
          setComments(mockData);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires:', err);
        toast.error('Erreur lors du chargement des commentaires');
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [playgroundId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error('Veuillez entrer un commentaire');
      return;
    }

    if (rating === 0) {
      toast.error('Veuillez attribuer une note');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour publier un commentaire');
      return;
    }

    try {
      setIsSubmitting(true);

      // Créer le commentaire localement d'abord pour une UI réactive
      const tempComment: Comment = {
        id: Date.now().toString(),
        playgroundId,
        content: newComment,
        rating,
        createdAt: new Date().toISOString(),
        author: user.email || 'Utilisateur',
      };

      // Ajouter le commentaire à l'état local
      setComments(prev => [tempComment, ...prev]);
      
      // Réinitialiser le formulaire
      setNewComment('');
      setRating(0);

      // Essayer d'envoyer le commentaire à Supabase
      try {
        const { error } = await addComment({
          playground_id: playgroundId,
          content: newComment,
          rating,
          author_id: user.id,
          author_name: user.email
        });

        if (error) {
          console.error('Erreur lors de l\'ajout du commentaire:', error);
          toast.error('Erreur lors de l\'ajout du commentaire');
        } else {
          toast.success('Commentaire publié avec succès');
        }
      } catch (supabaseError) {
        console.error('Erreur Supabase lors de l\'ajout du commentaire:', supabaseError);
        toast.error('Erreur lors de l\'ajout du commentaire, mais il est visible localement');
      }
    } catch (err) {
      console.error('Erreur lors de la publication du commentaire:', err);
      toast.error('Erreur lors de la publication du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Commentaires</h3>

      {/* Formulaire d'ajout */}
      <div className="space-y-4 p-4 rounded-lg border">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-6 w-6 cursor-pointer ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        
        <Textarea
          placeholder="Partagez votre expérience..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publication...
            </>
          ) : (
            'Publier'
          )}
        </Button>
      </div>

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Chargement des commentaires...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Aucun commentaire pour le moment. Soyez le premier à partager votre expérience !
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                <div>
                  <p className="font-medium">{comment.author}</p>
                  <div className="flex gap-1">
                    {Array.from({ length: comment.rating }).map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground mt-2">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}