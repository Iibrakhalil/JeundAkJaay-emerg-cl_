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
import { Label } from '../components/ui/label';
import { MapPin, Star, MessageCircle, Share2, Heart, ChevronLeft, Calendar, Briefcase, Flag, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { servicesAPI, reviewsAPI, reportsAPI, transactionsAPI, messagesAPI, authAPI } from '../utils/api';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [providerWhatsapp, setProviderWhatsapp] = useState(true);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await servicesAPI.getById(id);
      setService(response.data);
      try {
        const providerRes = await authAPI.getUserById(response.data.providerId);
        setProviderWhatsapp(providerRes.data.whatsappEnabled !== false);
      } catch {}
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getServiceReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer ce service ?')) {
      try {
        await servicesAPI.delete(id);
        toast({ title: 'Supprimé', description: 'Le service a été retiré.' });
        navigate('/profile');
      } catch (error) {
        toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
      }
    }
  };

 const handleContact = async () => {
  if (!isAuthenticated) { navigate('/login'); return; }
  if (user?.id === service.providerId) {
    toast({ title: 'Info', description: 'Vous ne pouvez pas vous contacter vous-même.' });
    return;
  }
  try {
    await messagesAPI.send({
      receiverId: service.providerId,
      message: `Bonjour, je suis intéressé(e) par votre service "${service.title}" sur Jënd-Ak-Jaay.`
    });
    navigate('/messages');
  } catch (error) {
    toast({ title: 'Erreur', description: 'Impossible d\'envoyer le message.', variant: 'destructive' });
  }
};

  const handleBooking = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowBookingDialog(true);
  };

  const confirmBooking = async () => {
    try {
      await transactionsAPI.create({
        itemType: 'service',
        itemId: id,
        paymentMethod
      });
      toast({ title: 'Réservé', description: 'Le prestataire a été notifié.' });
      setShowBookingDialog(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la réservation', variant: 'destructive' });
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    try {
      await reportsAPI.create({ targetType: 'service', targetId: id, reason: reportReason });
      toast({ title: 'Merci', description: 'Signalement envoyé.' });
      setShowReportDialog(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec du signalement', variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!service) return <div className="min-h-screen flex items-center justify-center">Service non trouvé</div>;

  const images = service.images || (service.image ? [service.image] : []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/services')} className="mb-6 hover:bg-orange-50">
          <ChevronLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Media Section */}
          <div className="space-y-4">
            <div className="aspect-video bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
               {images[selectedImage]?.match(/\.(mp4|mov|webm|avi)$/i) ? (
                  <video src={getMediaUrl(images[selectedImage])} className="w-full h-full object-cover" controls muted />
                ) : (
                  <img src={getMediaUrl(images[selectedImage])} alt="service" className="w-full h-full object-cover" />
                )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-video rounded-md overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-orange-500' : 'border-transparent'}`}
                  >
                    <img src={getMediaUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900">{language === 'fr' ? service.title : service.titleWo}</h1>
                {isAuthenticated && (user?.id === service.providerId || user?.id === service.provider_id) && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/edit-service/${id}`)}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" className="text-red-500" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-orange-100 text-orange-600 border-0">{service.category}</Badge>
                <span className="text-gray-500 flex items-center text-sm"><MapPin className="h-4 w-4 mr-1 text-orange-500" />{service.location}</span>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-orange-600">{service.rate?.toLocaleString()} FCFA</span>
                <span className="text-gray-500 ml-1">/{t.service?.[service.rateType] || service.rateType}</span>
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-orange-500 text-orange-500" /> {service.rating || '0.0'} ({service.reviewCount || 0} avis)</div>
              <div className="flex items-center gap-1 text-gray-600"><Calendar className="h-4 w-4" /> {service.availability}</div>
            </div>

            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900">Description</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{language === 'fr' ? service.description : service.descriptionWo}</p>
            </div>

            <Separator />
            <Card className="bg-white border-orange-50 shadow-sm">
              <div className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-orange-200">
                  <AvatarImage src={getMediaUrl(service.providerAvatar)} />
                  <AvatarFallback>{service.providerName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{service.providerName}</p>
                   <div className="flex items-center text-xs text-blue-600"><ShieldCheck className="h-3 w-3 mr-1" /> Prestataire vérifié</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/profile/${service.providerId}`)}>Voir profil</Button>
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              <Button className="py-7 text-lg bg-orange-600 hover:bg-orange-700 text-white font-bold" onClick={handleBooking}>
                Réserver ce service
              </Button>
              <Button variant="outline" className="py-6 border-2 border-orange-500 text-orange-600 font-semibold" onClick={handleContact}>
                <MessageCircle className="h-5 w-5 mr-2" /> Contacter le prestataire
              </Button>
            </div>

            <button onClick={() => setShowReportDialog(true)} className="w-full text-center text-xs text-red-500 hover:text-red-700 flex items-center justify-center gap-1 mt-4">
              <Flag className="h-3 w-3" /> Signaler ce service
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis sur ce service</h2>
          <div className="grid gap-4">
            {reviews.length > 0 ? reviews.map((r) => (
              <Card key={r.id} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6 flex gap-4">
                  <Avatar><AvatarImage src={getMediaUrl(r.userAvatar)} /><AvatarFallback>{r.userName?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-bold">{r.userName}</p>
                    <div className="flex items-center mb-1">
                       {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-gray-400 italic text-center py-8">Aucun avis pour le moment.</p>}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Réserver le service</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Button variant={paymentMethod === 'wave' ? 'default' : 'outline'} onClick={() => setPaymentMethod('wave')} className="justify-start py-6 font-semibold">Wave</Button>
              <Button variant={paymentMethod === 'orange' ? 'default' : 'outline'} onClick={() => setPaymentMethod('orange')} className="justify-start py-6 font-semibold">Orange Money</Button>
              <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="justify-start py-6 font-semibold">Paiement après prestation</Button>
            </div>
            {paymentMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                <strong>Note :</strong> Le prestataire sera informé que vous paierez après la prestation. Convenez des modalités avec lui avant le rendez-vous.
              </div>
            )}
            <Button disabled={!paymentMethod} className="w-full bg-orange-600 py-6 text-lg font-bold" onClick={confirmBooking}>Confirmer la réservation</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Signaler ce service</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="grid gap-2">
                {['Arnaque', 'Inapproprié', 'Faux profil'].map(reason => (
                  <Button key={reason} variant={reportReason === reason ? 'default' : 'outline'} onClick={() => setReportReason(reason)} className="justify-start">{reason}</Button>
                ))}
             </div>
             <Button disabled={!reportReason} className="w-full bg-red-600" onClick={handleReport}>Envoyer le signalement</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceDetailPage;
