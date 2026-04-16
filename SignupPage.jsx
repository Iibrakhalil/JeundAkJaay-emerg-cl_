import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { productsAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MapPin, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '@/lib/media';
import { Star } from 'lucide-react';

const ProductsPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
  const [sortBy, setSortBy] = useState('recent');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: sortBy
      };
      const response = await productsAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.nav.products}</h1>
          <p className="text-gray-600">Découvrez des milliers de produits d'occasion et locaux</p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t.hero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Catégorie */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>

                {/* Groupe Technologie & Mode */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  📱 Technologie & Mode
                </div>
                <SelectItem value="tech">{t.categories.tech}</SelectItem>
                <SelectItem value="electronics">{t.categories.electronics}</SelectItem>
                <SelectItem value="fashion">{t.categories.fashion}</SelectItem>
                <SelectItem value="beauty_products">{t.categories.beauty_products}</SelectItem>
                <SelectItem value="thrift">{t.categories.thrift}</SelectItem>

                {/* Groupe Maison & Véhicules */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  🏠 Maison & Véhicules
                </div>
                <SelectItem value="home">{t.categories.home}</SelectItem>
                <SelectItem value="vehicles">{t.categories.vehicles}</SelectItem>
                <SelectItem value="kids">{t.categories.kids}</SelectItem>
                <SelectItem value="real_estate">{t.categories.real_estate}</SelectItem>
                <SelectItem value="tools">{t.categories.tools}</SelectItem>
                <SelectItem value="sports">{t.categories.sports}</SelectItem>
                <SelectItem value="books">{t.categories.books}</SelectItem>

                {/* Groupe Agriculture & Alimentation */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                  🌾 Agriculture & Alimentation
                </div>
                <SelectItem value="agriculture">{t.categories.agriculture}</SelectItem>
                <SelectItem value="livestock">{t.categories.livestock}</SelectItem>
                <SelectItem value="fishing">{t.categories.fishing}</SelectItem>
                <SelectItem value="food_local">{t.categories.food_local}</SelectItem>
                <SelectItem value="crafts">{t.categories.crafts}</SelectItem>
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-300 overflow-hidden"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.images[0]?.match(/\.(mp4|mov|webm|avi)$/i) ? (
                    <video src={getMediaUrl(product.images[0])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" muted loop autoPlay playsInline />
                  ) : (
                    <img src={getMediaUrl(product.images[0])} alt={language === 'fr' ? product.title : product.titleWo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 border-0">
                    {t.product[product.condition]}
                  </Badge>
                  {product.category && (
                    <Badge className="absolute top-3 left-3 bg-orange-500/80 text-white border-0 text-xs">
                      {t.categories[product.category] || product.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
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
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getMediaUrl(product.sellerAvatar)} />
                      <AvatarFallback>{product.sellerName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 flex-1 truncate">{product.sellerName}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium ml-1">{product.sellerRating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
