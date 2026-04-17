import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '@/lib/media';
import { Search, Shirt, Laptop, Home, Baby, Sparkles, Wrench, Truck, Scissors, BookOpen, Package, ArrowRight, Star, TrendingUp, Utensils, MapPin, Briefcase, ShoppingBag } from 'lucide-react';
import api, { productsAPI } from '../utils/api';

const iconMap = {
  Shirt, Laptop, Home, Baby, Sparkles, Wrench, Truck, Scissors, BookOpen, Package, Utensils
};

const HomePage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [publicStats, setPublicStats] = useState({ products: 0, services: 0, users: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/public');
        setPublicStats(res.data);
      } catch (error) {
        console.error('Failed to load stats');
      }
    };
    
    const fetchRecentProducts = async () => {
      try {
        const res = await productsAPI.getAll({ sort: 'recent' });
        setRecentProducts(res.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to load recent products');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchStats();
    fetchRecentProducts();
  }, []);

  const productCategories = [
    { key: 'fashion', icon: 'Shirt', color: 'from-pink-500 to-rose-500' },
    { key: 'electronics', icon: 'Laptop', color: 'from-blue-500 to-cyan-500' },
    { key: 'home', icon: 'Home', color: 'from-green-500 to-emerald-500' },
    { key: 'kids', icon: 'Baby', color: 'from-purple-500 to-pink-500' }
  ];

  const serviceCategories = [
    { key: 'cleaning', icon: 'Sparkles', color: 'from-yellow-500 to-orange-500' },
    { key: 'handyman', icon: 'Wrench', color: 'from-gray-600 to-gray-800' },
    { key: 'delivery', icon: 'Truck', color: 'from-blue-600 to-indigo-600' },
    { key: 'beauty', icon: 'Scissors', color: 'from-pink-600 to-purple-600' },
    { key: 'tutoring', icon: 'BookOpen', color: 'from-green-600 to-teal-600' },
    { key: 'moving', icon: 'Package', color: 'from-orange-600 to-red-600' },
    { key: 'catering', icon: 'Utensils', color: 'from-red-500 to-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-yellow-600/10"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/35482670/pexels-photo-35482670.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 bg-white p-2 rounded-xl shadow-lg border border-orange-200">
                <Input
                  placeholder={t.hero.searchPlaceholder}
                  className="border-0 focus-visible:ring-0 text-lg"
                />
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8">
                  <Search className="h-5 w-5 mr-2" />
                  {t.hero.searchButton}
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{publicStats.products}</div>
                <div className="text-sm text-gray-600">{t.nav.products}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{publicStats.services}</div>
                <div className="text-sm text-gray-600">{t.nav.services}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{publicStats.users}</div>
                <div className="text-sm text-gray-600">Utilisateurs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu Produits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-orange-600" />
              Nouveautés sur Jënd-Ak-Jaay
            </h2>
            <p className="text-gray-600 mt-2">Découvrez les dernières annonces ajoutées</p>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex border-orange-200 text-orange-600 hover:bg-orange-50"
            onClick={() => navigate('/products')}
          >
            Voir tous les produits <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-xl"></div>
             ))}
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recentProducts.map((product) => (
              <Card 
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-300 overflow-hidden flex flex-col"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.images[0]?.match(/\.(mp4|mov|webm|avi)$/i) ? (
                    <video src={getMediaUrl(product.images[0])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" muted loop autoPlay playsInline />
                  ) : (
                    <img src={getMediaUrl(product.images[0])} alt={language === 'fr' ? product.title : product.titleWo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <Badge className="absolute top-2 right-2 bg-white/90 text-gray-900 border-0 text-[10px] md:text-xs">
                    {t.product?.[product.condition] || product.condition}
                  </Badge>
                </div>
                <CardContent className="p-3 md:p-4 space-y-2 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {language === 'fr' ? product.title : product.titleWo}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-lg md:text-xl font-bold text-orange-600">
                      {product.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  {/* Info Vendeur "Blindée" */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
                    <Avatar className="h-6 w-6 md:h-7 md:w-7 border border-orange-100 shadow-sm">
                      <AvatarImage 
                        src={getMediaUrl(product.seller?.avatar || product.sellerAvatar || product.user?.avatar)} 
                        className="object-cover" 
                      />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-bold">
                        {(product.seller?.name || product.sellerName || product.user?.name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] md:text-xs font-medium text-gray-600 flex-1 truncate">
                      {product.seller?.name || product.sellerName || product.user?.name || "Vendeur"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        <Button 
          className="w-full mt-6 md:hidden bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
          onClick={() => navigate('/products')}
        >
          Découvrir tous nos produits
        </Button>
      </section>

      {/* Catégories Produits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              {t.categories.productsTitle}
            </h2>
            <p className="text-gray-600 mt-2">Trouvez les meilleures offres près de chez vous</p>
          </div>
          <Button 
            variant="ghost" 
            className="hidden md:flex text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            onClick={() => navigate('/products')}
          >
            Explorer les catégories <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {productCategories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <Card 
                key={category.key}
                className="group cursor-pointer border-2 border-transparent hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                onClick={() => navigate(`/products?category=${category.key}`)}
              >
                <CardContent className="p-4 md:p-6 text-center space-y-4">
                  <div className={`mx-auto w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-orange-600 transition-colors">
                    {t.categories[category.key]}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Catégories Services */}
      <section className="bg-gradient-to-br from-orange-50 to-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-orange-600" />
                {t.categories.servicesTitle}
              </h2>
              <p className="text-gray-600 mt-2">Des professionnels pour tous vos besoins</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              onClick={() => navigate('/services')}
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceCategories.map((category) => {
              const Icon = iconMap[category.icon];
              return (
                <Card 
                  key={category.key}
                  className="group cursor-pointer border-2 border-transparent hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/services?category=${category.key}`)}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <div className={`mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                      {t.categories[category.key]}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Achat Sécurisé</h3>
              <p className="text-gray-600">Paiements via Wave et Orange Money. Vos transactions sont protégées.</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Vendez Facilement</h3>
              <p className="text-gray-600">Publiez vos annonces en quelques clics et touchez des milliers d'acheteurs.</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Services de Qualité</h3>
              <p className="text-gray-600">Professionnels vérifiés avec avis clients pour vous servir en toute confiance.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-yellow-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">Rejoignez Jënd-Ak-Jaay aujourd'hui</h2>
          <p className="text-xl text-white/90">Des milliers d'utilisateurs nous font confiance</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {!isAuthenticated ? (
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6"
                onClick={() => navigate('/signup')}
              >
                Créer un compte
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6"
                onClick={() => navigate('/post-product')}
              >
                Publier une annonce
              </Button>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => navigate('/products')}
            >
              Explorer la marketplace
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
