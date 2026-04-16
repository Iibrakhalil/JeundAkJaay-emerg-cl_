import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { servicesAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MapPin, Search, Star, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '@/lib/media';

const ServicesPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined
      };
      const response = await servicesAPI.getAll(params);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchServices();
  };

  const getRateDisplay = (service) => {
    const rateTypeText = t.service[service.rateType] || '';
    return `${service.rate.toLocaleString()} FCFA${rateTypeText}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.nav.services}</h1>
          <p className="text-gray-600">Des prestataires qualifiés pour tous vos besoins au Sénégal</p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher un service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Catégorie */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>

                {/* Envoi & Transport */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  ✈️ Envoi & Transport
                </div>
                <SelectItem value="gp_shipping">{t.categories.gp_shipping}</SelectItem>
                <SelectItem value="delivery">{t.categories.delivery}</SelectItem>
                <SelectItem value="moving">{t.categories.moving}</SelectItem>
                <SelectItem value="transport">{t.categories.transport}</SelectItem>

                {/* BTP & Artisanat */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  🔨 BTP & Artisanat
                </div>
                <SelectItem value="masonry">{t.categories.masonry}</SelectItem>
                <SelectItem value="plumbing">{t.categories.plumbing}</SelectItem>
                <SelectItem value="electricity">{t.categories.electricity}</SelectItem>
                <SelectItem value="painting">{t.categories.painting}</SelectItem>
                <SelectItem value="welding">{t.categories.welding}</SelectItem>
                <SelectItem value="handyman">{t.categories.handyman}</SelectItem>
                <SelectItem value="mechanics">{t.categories.mechanics}</SelectItem>

                {/* Beauté & Mode */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  💇 Beauté & Mode
                </div>
                <SelectItem value="hair_braiding">{t.categories.hair_braiding}</SelectItem>
                <SelectItem value="beauty">{t.categories.beauty}</SelectItem>
                <SelectItem value="tailoring">{t.categories.tailoring}</SelectItem>
                <SelectItem value="laundry">{t.categories.laundry}</SelectItem>

                {/* Services à domicile */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  🏠 Services à domicile
                </div>
                <SelectItem value="cleaning">{t.categories.cleaning}</SelectItem>
                <SelectItem value="cooking">{t.categories.cooking}</SelectItem>
                <SelectItem value="childcare">{t.categories.childcare}</SelectItem>
                <SelectItem value="security">{t.categories.security}</SelectItem>
                <SelectItem value="catering">{t.categories.catering}</SelectItem>

                {/* Éducation & Tech */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  📚 Éducation & Tech
                </div>
                <SelectItem value="tutoring">{t.categories.tutoring}</SelectItem>
                <SelectItem value="lessons">{t.categories.lessons}</SelectItem>
                <SelectItem value="it_services">{t.categories.it_services}</SelectItem>
                <SelectItem value="events">{t.categories.events}</SelectItem>

                {/* Agriculture & Santé */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  🌿 Agriculture & Santé
                </div>
                <SelectItem value="farming">{t.categories.farming}</SelectItem>
                <SelectItem value="health">{t.categories.health}</SelectItem>
                <SelectItem value="legal">{t.categories.legal}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* Grille de services */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-300 overflow-hidden"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={getMediaUrl(service.image || (service.images && service.images[0]))}
                    alt={language === 'fr' ? service.title : service.titleWo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <Badge className="bg-white/90 text-gray-900 border-0 text-sm font-semibold">
                      {getRateDisplay(service)}
                    </Badge>
                    {service.category && (
                      <Badge className="bg-orange-500/90 text-white border-0 text-xs">
                        {t.categories[service.category] || service.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {language === 'fr' ? service.title : service.titleWo}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {service.location}
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <Avatar className="h-10 w-10 border-2 border-orange-200">
                      <AvatarImage src={getMediaUrl(service.providerAvatar)} />
                      <AvatarFallback>{service.providerName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{service.providerName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium ml-1">{service.providerRating}</span>
                        </div>
                        <span className="text-xs text-gray-500">({service.providerReviewCount})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Briefcase className="h-4 w-4 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500">{service.providerCompletedJobs} jobs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
