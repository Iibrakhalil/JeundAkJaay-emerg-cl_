import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { servicesAPI, uploadAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { Upload, X, Edit3 } from 'lucide-react';
import { getMediaUrl } from '../lib/media';

const EditServicePage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '', titleWo: '', category: '', rate: '',
    rateType: '', location: '', description: '', descriptionWo: '', availability: ''
  });

  useEffect(() => { fetchService(); }, [id]);

  const fetchService = async () => {
    try {
      const res = await servicesAPI.getById(id);
      const s = res.data;
      setFormData({
        title: s.title, titleWo: s.titleWo || '', category: s.category,
        rate: s.rate.toString(), rateType: s.rateType, location: s.location,
        description: s.description, descriptionWo: s.descriptionWo || '',
        availability: s.availability || ''
      });
      const existing = s.images?.length > 0 ? s.images : (s.image ? [s.image] : []);
      setUploadedImages(existing.map(url => ({ url, type: url.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? 'video/mp4' : 'image/jpeg' })));
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger le service', variant: 'destructive' });
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    toast({ title: 'Upload...', description: `Traitement de ${files.length} fichier(s)` });
    const results = await Promise.all(files.map(async (file) => {
      try {
        const res = await uploadAPI.uploadImage(file);
        return { url: res.data.url, type: file.type };
      } catch { return null; }
    }));
    const valid = results.filter(r => r !== null);
    if (valid.length > 0) {
      setUploadedImages(prev => [...prev, ...valid]);
      toast({ title: 'Succès', description: `${valid.length} fichier(s) ajouté(s)` });
    }
  };

  const removeImage = (index) => setUploadedImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      toast({ title: 'Erreur', description: 'Ajoutez au moins une image', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const urls = uploadedImages.map(i => typeof i === 'object' ? i.url : i);
      await servicesAPI.update(id, {
        ...formData, rate: parseFloat(formData.rate),
        images: urls, image: urls[0]
      });
      toast({ title: 'Mis à jour !', description: 'Votre service a été modifié.' });
      navigate(`/service/${id}`);
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-8 text-center text-orange-600">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-orange-50/50">
            <CardTitle className="text-2xl flex items-center gap-2 text-orange-700">
              <Edit3 className="h-6 w-6" /> Modifier le service
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Titre (Français)</Label><Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                <div><Label>Titre (Wolof)</Label><Input value={formData.titleWo} onChange={(e) => setFormData({...formData, titleWo: e.target.value})} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Prix (FCFA)</Label><Input type="number" required value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} /></div>
                <div>
                  <Label>Type de tarif</Label>
                  <Select value={formData.rateType} onValueChange={(v) => setFormData({...formData, rateType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perHour">Par heure</SelectItem>
                      <SelectItem value="perDay">Par jour</SelectItem>
                      <SelectItem value="fixed">Forfait fixe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Ménage / Nettoyage</SelectItem>
                    <SelectItem value="delivery">Livraison</SelectItem>
                    <SelectItem value="repairs">Réparations</SelectItem>
                    <SelectItem value="beauty">Beauté / Coiffure</SelectItem>
                    <SelectItem value="lessons">Cours / Tutorat</SelectItem>
                    <SelectItem value="moving">Déménagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Disponibilité</Label><Input value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} placeholder="Ex: Lun-Ven, 8h-18h" /></div>
              <div><Label>Description</Label><Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} /></div>
              <div>
                <Label>Photos / Vidéos</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Ajouter des fichiers</span>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        {(typeof img === 'object' ? img.type : '').startsWith('video') ? (
                          <video src={typeof img === 'object' ? img.url : getMediaUrl(img)} className="w-full h-full object-cover rounded" muted />
                        ) : (
                          <img src={typeof img === 'object' ? img.url : getMediaUrl(img)} alt="preview" className="w-full h-full object-cover rounded" />
                        )}
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Annuler</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold">
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditServicePage;
