import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { servicesAPI, uploadAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { getMediaUrl } from '../lib/media';

const PostServicePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    titleWo: '',
    category: '',
    rate: '',
    rateType: 'perHour',
    location: '',
    description: '',
    descriptionWo: '',
    availability: ''
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    toast({ title: 'Upload...', description: `Traitement de ${files.length} fichier(s)` });

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await uploadAPI.uploadImage(file);
        return response.data.url;
      } catch (error) {
        console.error('Upload error:', error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const validUrls = results.filter(url => url !== null);

    if (validUrls.length > 0) {
      setUploadedImages(prev => [...prev, ...validUrls]);
      toast({ title: 'Succès', description: `${validUrls.length} fichier(s) ajouté(s)` });
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez ajouter au moins une image', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        rate: parseFloat(formData.rate),
        images: uploadedImages,
        image: uploadedImages[0]
      };

      await servicesAPI.create(serviceData);
      toast({ title: 'Succès !', description: 'Service créé avec succès' });
      navigate('/profile');
    } catch (error) {
      toast({ title: 'Erreur', description: error.response?.data?.detail || 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Groupes de catégories de services
  const serviceCategoryGroups = [
    {
      label: '✈️ Envoi & Transport',
      items: [
        { value: 'gp_shipping', label: t.categories.gp_shipping },
        { value: 'delivery', label: t.categories.delivery },
        { value: 'moving', label: t.categories.moving },
        { value: 'transport', label: t.categories.transport },
      ]
    },
    {
      label: '🔨 BTP & Artisanat',
      items: [
        { value: 'masonry', label: t.categories.masonry },
        { value: 'plumbing', label: t.categories.plumbing },
        { value: 'electricity', label: t.categories.electricity },
        { value: 'painting', label: t.categories.painting },
        { value: 'welding', label: t.categories.welding },
        { value: 'handyman', label: t.categories.handyman },
        { value: 'mechanics', label: t.categories.mechanics },
      ]
    },
    {
      label: '💇 Beauté & Mode',
      items: [
        { value: 'hair_braiding', label: t.categories.hair_braiding },
        { value: 'beauty', label: t.categories.beauty },
        { value: 'tailoring', label: t.categories.tailoring },
        { value: 'laundry', label: t.categories.laundry },
      ]
    },
    {
      label: '🏠 Services à domicile',
      items: [
        { value: 'cleaning', label: t.categories.cleaning },
        { value: 'cooking', label: t.categories.cooking },
        { value: 'childcare', label: t.categories.childcare },
        { value: 'security', label: t.categories.security },
        { value: 'catering', label: t.categories.catering },
      ]
    },
    {
      label: '📚 Éducation & Tech',
      items: [
        { value: 'tutoring', label: t.categories.tutoring },
        { value: 'lessons', label: t.categories.lessons },
        { value: 'it_services', label: t.categories.it_services },
        { value: 'events', label: t.categories.events },
      ]
    },
    {
      label: '🌿 Agriculture & Santé',
      items: [
        { value: 'farming', label: t.categories.farming },
        { value: 'health', label: t.categories.health },
        { value: 'legal', label: t.categories.legal },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">🛠️ Proposer un Service</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titres */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom du service (Français) *</Label>
                  <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Plombier urgence Dakar" />
                </div>
                <div>
                  <Label>Nom du service (Wolof) <span className="text-gray-400 text-xs">— optionnel</span></Label>
                  <Input value={formData.titleWo} onChange={(e) => setFormData({...formData, titleWo: e.target.value})} placeholder="Ex: Plombier ci Dakar" />
                </div>
              </div>

              {/* Tarif / Unité / Catégorie */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Tarif (FCFA) *</Label>
                  <Input type="number" required min="0" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} placeholder="Ex: 15000" />
                </div>
                <div>
                  <Label>Unité *</Label>
                  <Select value={formData.rateType} onValueChange={(value) => setFormData({...formData, rateType: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perHour">Par heure</SelectItem>
                      <SelectItem value="perDay">Par jour</SelectItem>
                      <SelectItem value="fixed">Prix fixe</SelectItem>
                      <SelectItem value="perProject">Par projet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Catégorie *</Label>
                  <Select required value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                    <SelectContent>
                      {serviceCategoryGroups.map((group) => (
                        <React.Fragment key={group.label}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t first:border-t-0">
                            {group.label}
                          </div>
                          {group.items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localisation */}
              <div>
                <Label>Localisation *</Label>
                <Input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Ex: Dakar, Grand Yoff" />
              </div>

              {/* Description + Disponibilité */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Description (Français) *</Label>
                  <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Décrivez votre service, vos compétences, vos réalisations..." />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Description (Wolof) <span className="text-gray-400 text-xs">— optionnel</span></Label>
                    <Textarea value={formData.descriptionWo} onChange={(e) => setFormData({...formData, descriptionWo: e.target.value})} rows={2} placeholder="Xamlekat..." />
                  </div>
                  <div>
                    <Label>Disponibilité *</Label>
                    <Input required value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} placeholder="Ex: Lun-Sam 8h-20h, 7j/7, Sur RDV" />
                  </div>
                </div>
              </div>

              {/* Upload photos */}
              <div>
                <Label>Photos de votre travail <span className="text-red-500">*</span></Label>
                <p className="text-xs text-gray-500 mb-2">Ajoutez des photos de vos réalisations pour inspirer confiance.</p>
                <div className="mt-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Cliquer pour uploader plusieurs fichiers</span>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        {img.match(/\.(mp4|mov|webm)$/i) ? (
                          <video src={getMediaUrl(img)} className="w-full h-full object-cover rounded" muted />
                        ) : (
                          <img src={getMediaUrl(img)} alt="upload" className="w-full h-full object-cover rounded" />
                        )}
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 py-6">Annuler</Button>
                <Button type="submit" disabled={loading} className="flex-1 py-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-lg">
                  {loading ? 'Publication...' : 'Publier le service'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostServicePage;
