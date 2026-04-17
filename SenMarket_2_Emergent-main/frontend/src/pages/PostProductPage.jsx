import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { productsAPI, uploadAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { getMediaUrl } from '@/lib/media';

const PostProductPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    titleWo: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    description: '',
    descriptionWo: ''
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
        toast({
          title: 'Erreur',
          description: `Échec pour ${file.name}: ${error.response?.data?.detail || 'Serveur indisponible'}`,
          variant: 'destructive'
        });
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

    const images = uploadedImages.length > 0
      ? uploadedImages
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'];

    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        images: images
      };

      await productsAPI.create(productData);
      toast({ title: 'Succès !', description: 'Produit créé avec succès' });
      navigate('/profile');
    } catch (error) {
      toast({ title: 'Erreur', description: error.response?.data?.detail || 'Création échouée', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const productCategoryGroups = [
    {
      label: '📱 Technologie & Mode',
      items: [
        { value: 'tech', label: t.categories.tech },
        { value: 'electronics', label: t.categories.electronics },
        { value: 'fashion', label: t.categories.fashion },
        { value: 'beauty_products', label: t.categories.beauty_products },
        { value: 'thrift', label: t.categories.thrift },
      ]
    },
    {
      label: '🏠 Maison & Véhicules',
      items: [
        { value: 'home', label: t.categories.home },
        { value: 'vehicles', label: t.categories.vehicles },
        { value: 'kids', label: t.categories.kids },
        { value: 'real_estate', label: t.categories.real_estate },
        { value: 'tools', label: t.categories.tools },
        { value: 'sports', label: t.categories.sports },
        { value: 'books', label: t.categories.books },
      ]
    },
    {
      label: '🌾 Agriculture, Élevage & Alimentation',
      items: [
        { value: 'agriculture', label: t.categories.agriculture },
        { value: 'livestock', label: t.categories.livestock },
        { value: 'fishing', label: t.categories.fishing },
        { value: 'food_local', label: t.categories.food_local },
        { value: 'crafts', label: t.categories.crafts },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-2xl">🛍️ Vendre un produit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Titre (Français) *</Label>
                    <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Sac de riz local 50kg" />
                  </div>
                  <div>
                    <Label>Titre (Wolof) <span className="text-gray-400 text-xs">— optionnel</span></Label>
                    <Input value={formData.titleWo} onChange={(e) => setFormData({...formData, titleWo: e.target.value})} placeholder="Ex: Mboormboox 50kg" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Prix (FCFA) *</Label>
                    <Input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Ex: 25000" />
                  </div>
                  <div>
                    <Label>Catégorie *</Label>
                    <Select required value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                      <SelectContent>
                        {productCategoryGroups.map((group) => (
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
                  <div>
                    <Label>État *</Label>
                    <Select required value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                      <SelectTrigger><SelectValue placeholder="Choisir l'état" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Neuf</SelectItem>
                        <SelectItem value="likeNew">Comme neuf</SelectItem>
                        <SelectItem value="good">Bon état</SelectItem>
                        <SelectItem value="fair">État correct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Localisation *</Label>
                  <Input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Ex: Dakar, Plateau" />
                </div>

                <div>
                  <Label>Description (Français) *</Label>
                  <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Décrivez votre produit en détail..." />
                </div>
                <div>
                  <Label>Description (Wolof) <span className="text-gray-400 text-xs">— optionnel</span></Label>
                  <Textarea value={formData.descriptionWo} onChange={(e) => setFormData({...formData, descriptionWo: e.target.value})} rows={4} placeholder="Xamlekat bu detailed..." />
                </div>

                <div>
                  <Label>Photos / Vidéos</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors bg-white">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Cliquer pour uploader (sélection multiple)</span>
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative bg-black rounded shadow-sm">
                          {img.match(/\.(mp4|mov|webm)$/i) ? (
                            <video src={getMediaUrl(img)} className="w-full h-24 object-cover rounded" muted />
                          ) : (
                            <img src={getMediaUrl(img)} alt="Uploaded" className="w-full h-24 object-cover rounded" />
                          )}
                          <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Annuler</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold hover:from-orange-600 hover:to-yellow-600 transition-all">
                  {loading ? 'Publication...' : 'Publier le produit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostProductPage;
