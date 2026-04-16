import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { reviewsAPI } from '../utils/api';
import { toast } from '../hooks/use-toast';

const RatingDialog = ({ open, onOpenChange, targetId, targetType, targetName, itemId, itemType, itemName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une note', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Avis sur le vendeur/prestataire
      await reviewsAPI.create({ targetType, targetId, rating, comment });

      // Avis sur le produit/service si disponible
      if (itemId && itemType) {
        try {
          await reviewsAPI.create({ targetType: itemType, targetId: itemId, rating, comment });
        } catch {}
      }

      toast({ title: 'Merci !', description: 'Votre avis a été publié avec succès.' });
      if (onSuccess) onSuccess();
      onOpenChange(false);
      setRating(0);
      setComment('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            ⭐ Noter {targetName}
          </DialogTitle>
          <DialogDescription>
            {itemName && <span>Votre avis sera aussi visible sur <strong>{itemName}</strong>.<br/></span>}
            Partagez votre expérience avec la communauté Jënd-Ak-Jaay.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star className={`h-10 w-10 ${(hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          <div className="w-full space-y-2">
            <p className="text-sm font-medium text-gray-700">Votre commentaire (optionnel)</p>
            <Textarea
              placeholder="Racontez-nous comment ça s'est passé..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] border-2 focus:border-orange-500"
            />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-6"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Publication...' : 'Publier mon avis'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
