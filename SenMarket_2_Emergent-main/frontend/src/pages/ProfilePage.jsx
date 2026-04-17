import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI, servicesAPI, otpAPI, reviewsAPI, authAPI, uploadAPI } from '../utils/api';
import { toast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '@/lib/media';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Star, MapPin, Edit, ShoppingBag, Briefcase, ShieldCheck, Phone, MessageSquare, Camera, MessageCircle } from 'lucide-react';

const ProfilePage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userProducts, setUserProducts] = useState([]);
  const [userServices, setUserServices] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // NOUVEAU : Ajout de whatsappEnabled dans editData
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    location: user?.location || '',
    avatar: user?.avatar || '',
    payoutPhone: user?.payoutPhone || '',
    whatsappEnabled: user?.whatsappEnabled || false // L'utilisateur peut l'activer/désactiver
  });

  const sendOtp = async () => {
    try {
      const res = await otpAPI.send();
      setOtpSent(true);
      setDevCode(res.data.dev_code || '');
      setShowOtpDialog(true);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur');
    }
  };

  const verifyOtp = async () => {
    try {
      await otpAPI.verify(otpCode);
      alert('Numéro vérifié avec succès ✓');
      setShowOtpDialog(false);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.detail || 'Code invalide');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await authAPI.updateProfile(editData);
      toast({ title: 'Profil mis à jour', description: 'Vos modifications ont été enregistrées.' });
      setShowEditDialog(false);
      window.location.reload();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadAPI.uploadImage(file);
      const url = res.data.url;
      setEditData({ ...editData, avatar: url });
      toast({ title: 'Photo uploadée', description: 'Cliquez sur Enregistrer pour sauvegarder.' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de l\'upload', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        try {
          const [productsRes, servicesRes, reviewsRes] = await Promise.all([
            productsAPI.getUserProducts(user.id),
            servicesAPI.getUserServices(user.id),
            reviewsAPI.getUserReviews(user.id)
          ]);
          setUserProducts(productsRes.data);
          setUserServices(servicesRes.data);
          setUserReviews(reviewsRes.data);
        } catch (error) {
          console.error("Failed to fetch user items", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 border-2 border-orange-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={getMediaUrl(user?.avatar)} />
                <AvatarFallback className="text-3xl">{user?.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left mt-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2 justify-center md:justify-start">
                  {user?.firstName} {user?.lastName}
                  {user?.isVerified && (
                    <ShieldCheck className="h-6 w-6 text-blue-500 fill-blue-100" />
                  )}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4 text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user?.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{user?.rating || 0}</span>
                    <span className="text-sm ml-1">({user?.reviewCount || 0} avis)</span>
                  </div>
                </div>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">{user?.phone}</p>
                {!user?.phoneVerified && (
                  <Button size="sm" variant="outline" className="mt-2 border-blue-500 text-blue-600 hover:bg-blue-50" onClick={sendOtp}>
                    <Phone className="h-4 w-4 mr-1" />
                    Vérifier mon numéro
                  </Button>
                )}
                {user?.phoneVerified && (
                  <Badge className="mt-2 bg-green-100 text-green-800">✓ Téléphone vérifié</Badge>
                )}
                {user?.payoutPhone && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-100 rounded-lg">
                    <p className="text-xs text-orange-600 font-semibold mb-1 uppercase tracking-wider">Compte de retrait (Wave/OM)</p>
                    <p className="text-sm font-bold text-gray-900">{user.payoutPhone}</p>
                  </div>
                )}
                {/* NOUVEAU : Afficher le statut WhatsApp sur le profil */}
                {user?.whatsappEnabled && (
                  <Badge className="mt-2 ml-2 bg-green-500 text-white">
                    <MessageCircle className="h-3 w-3 mr-1 inline" /> Contact WhatsApp Activé
                  </Badge>
                )}
              </div>
              <Button variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-orange-200">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-10 w-10 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{userProducts.length}</div>
              <div className="text-gray-600">Produits en vente</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-10 w-10 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{userServices.length}</div>
              <div className="text-gray-600">Services proposés</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200">
            <CardContent className="p-6 text-center">
              <Star className="h-10 w-10 text-yellow-500 mx-auto mb-2 fill-yellow-500" />
              <div className="text-3xl font-bold text-gray-900">{user?.rating || 0}</div>
              <div className="text-gray-600">Note moyenne</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs — grid-cols-3 pour que les 3 onglets soient toujours visibles */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-orange-200 p-1">
            <TabsTrigger value="products" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
              <ShoppingBag className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Mes </span>Produits
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
              <Briefcase className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Mes </span>Services
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
              Avis ({userReviews.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── Onglet Produits ─── */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-300"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={getMediaUrl(product.images[0])}
                      alt={language === 'fr' ? product.title : product.titleWo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 border-0">
                      {t.product[product.condition]}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {language === 'fr' ? product.title : product.titleWo}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {product.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        {product.price.toLocaleString()} FCFA
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Carte "Ajouter un produit" */}
              <Card
                className="border-2 border-dashed border-gray-300 hover:border-orange-500 cursor-pointer transition-all group"
                onClick={() => navigate('/post-product')}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center mb-4 transition-colors">
                    <ShoppingBag className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ajouter un produit</h3>
                  <p className="text-sm text-gray-600">Vendez vos articles en quelques clics</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Onglet Services ─── */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.map((service) => (
                <Card
                  key={service.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-300"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={getMediaUrl(service.image || (service.images && service.images[0]))}
                      alt={language === 'fr' ? service.title : service.titleWo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 text-xs">
                      {t.categories[service.category] || service.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {language === 'fr' ? service.title : service.titleWo}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.location}
                    </div>
                    <div className="text-xl font-bold text-orange-600">
                      {service.rate.toLocaleString()} FCFA{t.service[service.rateType]}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Carte "Ajouter un service" */}
              <Card
                className="border-2 border-dashed border-gray-300 hover:border-orange-500 cursor-pointer transition-all group"
                onClick={() => navigate('/post-service')}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center mb-4 transition-colors">
                    <Briefcase className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ajouter un service</h3>
                  <p className="text-sm text-gray-600">Proposez vos compétences</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Onglet Avis ─── */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {userReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun avis reçu pour le moment</p>
                </div>
              ) : (
                userReviews.map((review) => (
                  <Card key={review.id} className="border-2 border-gray-100">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={getMediaUrl(review.userAvatar)} />
                          <AvatarFallback>{review.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900">{review.userName}</p>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-400">
                            Posté le {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            {review.targetType === 'user' ? ' (Note utilisateur)' : ` (Sur l'annonce : ${review.targetId})`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog — Vérification OTP */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📱 Vérification du numéro</DialogTitle>
            <DialogDescription>
              Un code à 6 chiffres a été envoyé à votre numéro {user?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {devCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 mb-1">🧪 Mode développement — Code :</p>
                <p className="text-2xl font-bold text-blue-800 tracking-widest">{devCode}</p>
              </div>
            )}
            <Input
              placeholder="Entrez le code à 6 chiffres"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />
            <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white" onClick={verifyOtp}>
              Vérifier
            </Button>
            <button onClick={sendOtp} className="w-full text-sm text-orange-600 hover:underline">
              Renvoyer le code
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog — Modifier le profil */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📝 Modifier le profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input value={editData.firstName} onChange={(e) => setEditData({...editData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input value={editData.lastName} onChange={(e) => setEditData({...editData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localisation</label>
              <Input value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo de profil</label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-orange-500">
                  <AvatarImage src={getMediaUrl(editData.avatar)} />
                  <AvatarFallback>{editData.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg hover:bg-orange-100 transition-colors">
                      <Camera className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">Choisir une photo</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <label className="text-sm font-bold text-orange-700">Numéro de retrait (Wave / OM)</label>
              <p className="text-xs text-orange-600 mb-2">L'argent des ventes sera envoyé sur ce numéro.</p>
              <Input
                placeholder="Ex: 77 123 45 67"
                value={editData.payoutPhone}
                onChange={(e) => setEditData({...editData, payoutPhone: e.target.value})}
                className="border-orange-200 focus:border-orange-500 bg-white"
              />
            </div>
            
            {/* NOUVEAU : Option WhatsApp dans le profil */}
            <div className="p-4 border border-green-200 bg-green-50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-green-800 cursor-pointer" onClick={() => setEditData({...editData, whatsappEnabled: !editData.whatsappEnabled})}>
                      Autoriser le contact WhatsApp
                    </label>
                    <p className="text-xs text-green-600 mt-0.5">Ajoute un bouton WhatsApp sur vos annonces</p>
                  </div>
                </div>
                {/* Bouton Toggle Tailwind */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={editData.whatsappEnabled}
                    onChange={(e) => setEditData({...editData, whatsappEnabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>

            <Button className="w-full bg-orange-500 hover:bg-orange-600 py-6 font-bold" onClick={handleUpdateProfile}>
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
