import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { productsAPI, uploadAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { Upload, X, Trash2, Edit3 } from 'lucide-react';
import { getMediaUrl } from '../lib/media';

const EditProductPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productsAPI.getById(id);
      const p = res.data;
      setFormData({
        title: p.title,
        titleWo: p.titleWo || '',
        price: p.price.toString(),
        category: p.category,
        condition: p.condition,
        location: p.location,
        description: p.description,
        descriptionWo: p.descriptionWo || ''
      });
      setUploadedImages(p.images || []);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger le produit', variant: 'destructive' });
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    toast({ title: 'Upload...', description: `Traitement de ${files.length} fichier(s)` });
    
    const uploadPromises = files.map(async (file) => {
      try {
        const response = await uploadAPI.uploadImage(file);
        return response.data.url;
      } catch (error) {
        toast({ title: 'Erreur', description: `Échec pour ${file.name}`, variant: 'destructive' });
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const validUrls = results.filter(url => url !== null);
    if (validUrls.length > 0) {
      setUploadedImages(prev => [...prev, ...validUrls]);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        images: uploadedImages
      };
      
      await productsAPI.update(id, productData);
      toast({ title: 'Mis à jour !', description: 'Votre annonce a été modifiée.' });
      navigate(`/product/${id}`);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-orange-600">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Edit3 className="h-6 w-6 text-blue-600" />
              Modifier l'annonce
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Titre (Français)</Label>
                    <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <Label>Titre (Wolof)</Label>
                    <Input value={formData.titleWo} onChange={(e) => setFormData({...formData, titleWo: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Prix (FCFA)</Label>
                    <Input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Informatique</SelectItem>
                        <SelectItem value="electronics">Électronique</SelectItem>
                        <SelectItem value="fashion">Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>État</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                      <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Neuf</SelectItem>
                        <SelectItem value="likeNew">Comme neuf</SelectItem>
                        <SelectItem value="good">Bon état</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Localisation</Label>
                  <Input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} />
                </div>

                <div>
                  <Label>Images Current & Nouvelles</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Ajouter plus d'images/vidéos</span>
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative bg-black rounded group">
                        {img.match(/\.(mp4|mov|webm)$/i) || img.includes('/media/') ? (
                                <video src={getMediaUrl(img)} className="w-full h-24 object-cover rounded" muted />
                              ) : (
                                <img src={getMediaUrl(img)} alt="Preview" className="w-full h-24 object-cover rounded" />
                              )}
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Annuler</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProductPage;
