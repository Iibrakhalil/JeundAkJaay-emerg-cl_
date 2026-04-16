import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '../lib/media';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { MapPin, Star, MessageCircle, Share2, Heart, ChevronLeft, ShoppingCart, Flag, ShieldCheck, Edit3, Trash2, Eye } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { productsAPI, reviewsAPI, reportsAPI, transactionsAPI, messagesAPI, authAPI, favoritesAPI } from '../utils/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [deliveryZone, setDeliveryZone] = useState('none');
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [sellerWhatsapp, setSellerWhatsapp] = useState(true);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
      // Charger whatsappEnabled du vendeur
      try {
        const sellerRes = await authAPI.getUserById(response.data.sellerId);
        setSellerWhatsapp(sellerRes.data.whatsappEnabled !== false);
      } catch {}
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getProductReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) {
      try {
        await productsAPI.delete(id);
        toast({ title: 'Supprimé', description: 'Votre annonce a été retirée.' });
        navigate('/profile');
      } catch (error) {
        toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
      }
    }
  };

  const handleContact = async () => {
  if (!isAuthenticated) { navigate('/login'); return; }
  if (user?.id === product.sellerId) {
    toast({ title: 'Info', description: 'Vous ne pouvez pas vous contacter vous-même.' });
    return;
  }
  try {
    await messagesAPI.send({
      receiverId: product.sellerId,
      message: `Bonjour, je suis intéressé(e) par votre annonce "${product.title}" à ${product.price?.toLocaleString()} FCFA.`
    });
    navigate('/messages');
  } catch (error) {
    toast({ title: 'Erreur', description: 'Impossible d\'envoyer le message.', variant: 'destructive' });
  }
};

  const handleWhatsApp = () => {
    if (!product?.sellerPhone) {
      toast({ title: 'Indisponible', description: 'Numéro absent', variant: 'destructive' });
      return;
    }
    const phone = product.sellerPhone.replace(/\s/g, '');
    const message = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${product.title}" sur Jënd-Ak-Jaay.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    try {
      if (!paymentMethod) return;
      await transactionsAPI.create({
        itemType: 'product',
        itemId: id,
        paymentMethod,
        deliveryZone
      });
      toast({ title: 'Succès', description: 'Commande enregistrée.' });
      setShowPaymentDialog(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec du paiement', variant: 'destructive' });
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    try {
      await reportsAPI.create({ targetType: 'product', targetId: id, reason: reportReason });
      toast({ title: 'Merci', description: 'Signalement envoyé.' });
      setShowReportDialog(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec du signalement', variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Produit non trouvé</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border">
               {product.images?.[selectedImage]?.match(/\.(mp4|mov|webm|avi)$/i) ? (
                  <video src={getMediaUrl(product.images[selectedImage])} className="w-full h-full object-cover" controls muted />
                ) : (
                  <img src={getMediaUrl(product.images?.[selectedImage])} alt="product" className="w-full h-full object-cover" />
                )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${selectedImage === idx ? 'border-orange-500' : 'border-transparent'}`}
                >
                  <img src={getMediaUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{language === 'fr' ? product.title : product.titleWo}</h1>
                {isAuthenticated && (user?.id === product.sellerId || user?.id === product.seller_id) && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/edit-product/${id}`)}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" className="text-red-500" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-600 border-0">{t.product?.[product.condition] || product.condition}</Badge>
                <span className="text-gray-500 flex items-center text-sm"><MapPin className="h-4 w-4 mr-1" />{product.location}</span>
              </div>
              <p className="text-4xl font-bold text-orange-600 mt-4">{product.price?.toLocaleString()} FCFA</p>
            </div>

            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">{t.product?.description || 'Description'}</h3>
              <p className="text-gray-600 whitespace-pre-line">{language === 'fr' ? product.description : product.descriptionWo}</p>
            </div>
            
            <Separator />
            <Card className="bg-white border-orange-100">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12"><AvatarImage src={getMediaUrl(product.sellerAvatar)} /><AvatarFallback>{product.sellerName?.[0]}</AvatarFallback></Avatar>
                <div className="flex-1 text-sm">
                  <p className="font-bold">{product.sellerName}</p>
                  <div className="flex items-center text-orange-500">
                    <Star className="h-3 w-3 fill-orange-500 mr-1" /> {product.sellerRating || 0} ({product.sellerReviewCount || 0})
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/profile/${product.sellerId}`)}>Profil</Button>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button className="py-7 text-lg bg-orange-600 hover:bg-orange-700" onClick={handleBuy}>
                <ShoppingCart className="mr-2" /> {t.product?.buy || 'Commander'}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="py-6" onClick={handleContact}><MessageCircle className="mr-2" /> Message</Button>
                {sellerWhatsapp && <Button className="bg-green-500 hover:bg-green-600 py-6" onClick={handleWhatsApp}>WhatsApp</Button>}
              </div>
            </div>

            <button onClick={() => setShowReportDialog(true)} className="w-full text-center text-xs text-red-400 hover:text-red-600 flex items-center justify-center">
              <Flag className="h-3 w-3 mr-1" /> Signaler
            </button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Avis clients</h2>
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map((r) => (
              <Card key={r.id}><CardContent className="p-4 flex gap-4">
                <Avatar><AvatarImage src={getMediaUrl(r.userAvatar)} /><AvatarFallback>{r.userName?.[0]}</AvatarFallback></Avatar>
                <div>
                  <p className="font-bold">{r.userName}</p>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                </div>
              </CardContent></Card>
            )) : <p className="text-gray-400 italic">Aucun avis.</p>}
          </div>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Paiement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Button variant={paymentMethod === 'wave' ? 'default' : 'outline'} onClick={() => setPaymentMethod('wave')} className="justify-start py-6">Wave</Button>
              <Button variant={paymentMethod === 'orange' ? 'default' : 'outline'} onClick={() => setPaymentMethod('orange')} className="justify-start py-6">Orange Money</Button>
              <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="justify-start py-6">Paiement à la livraison</Button>
            </div>
            {paymentMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                <strong>Note :</strong> Le vendeur sera informé que vous paierez à la livraison. Assurez-vous de convenir des modalités avec lui avant la rencontre.
              </div>
            )}
            <div className="space-y-2">
              <Label>Livraison</Label>
              <Select value={deliveryZone} onValueChange={setDeliveryZone}>
                <SelectTrigger><SelectValue placeholder="Choisir une zone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Retrait sur place</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button disabled={!paymentMethod} className="w-full bg-orange-600" onClick={handleConfirmPayment}>Valider</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Signaler</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <Select onValueChange={setReportReason}><SelectTrigger><SelectValue placeholder="Raison" /></SelectTrigger>
               <SelectContent><SelectItem value="scam">Arnaque</SelectItem><SelectItem value="fake">Faux</SelectItem></SelectContent>
             </Select>
             <Button className="w-full bg-red-600" onClick={handleReport}>Signaler</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage;
