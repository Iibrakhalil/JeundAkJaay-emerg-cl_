import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../utils/api';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getMediaUrl } from '@/lib/media';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  ShoppingBag, Briefcase, MessageCircle, User, LogOut, Globe,
  Menu, X, Plus, Receipt, ShieldCheck, Home
} from 'lucide-react';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      try {
        const res = await messagesAPI.getConversations();
        const count = res.data.filter(c => c.unread).length;
        setUnreadCount(count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-lg transform group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Jënd-Ak-Jaay
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/products" className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors">
                <ShoppingBag className="h-4 w-4" /><span className="font-medium">{t.nav.products}</span>
              </Link>
              <Link to="/services" className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors">
                <Briefcase className="h-4 w-4" /><span className="font-medium">{t.nav.services}</span>
              </Link>
              {isAuthenticated && (
                <Link to="/messages" className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors relative">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-medium">{t.nav.messages}</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center space-x-1 hover:bg-orange-50">
                <Globe className="h-4 w-4" />
                <span className="font-medium">{language === 'fr' ? 'Wolof' : 'Français'}</span>
              </Button>

              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                        <Plus className="h-4 w-4 mr-1" />Publier
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('/post-product')}>
                        <ShoppingBag className="h-4 w-4 mr-2" />{t.nav.postProduct}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/post-service')}>
                        <Briefcase className="h-4 w-4 mr-2" />{t.nav.postService}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none">
                        <Avatar className="h-8 w-8 border-2 border-orange-500">
                          <AvatarImage src={getMediaUrl(user.avatar)} />
                          <AvatarFallback className="bg-orange-100 text-orange-700">{user.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="h-4 w-4 mr-2" />{t.nav.profile}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/transactions')}>
                        <Receipt className="h-4 w-4 mr-2" />Mes Transactions
                      </DropdownMenuItem>
                      {user?.isAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="text-blue-600 font-semibold bg-blue-50 focus:bg-blue-100">
                          <ShieldCheck className="h-4 w-4 mr-2" />Dashboard Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />{t.nav.logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')} className="hover:bg-orange-50">{t.nav.login}</Button>
                  <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">{t.nav.signup}</Button>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-1">
              <button
                onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full text-left px-3 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="font-medium">{language === 'fr' ? 'Passer en Wolof' : 'Passer en Français'}</span>
              </button>
              <div className="border-t border-gray-100 my-2" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 bg-orange-50 rounded-xl mb-2">
                    <Avatar className="h-10 w-10 border-2 border-orange-400">
                      <AvatarImage src={getMediaUrl(user.avatar)} />
                      <AvatarFallback className="bg-orange-100 text-orange-700">{user.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={() => navigate('/post-product')} className="flex flex-col items-center gap-1 px-3 py-3 bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-xl font-medium text-sm">
                      <ShoppingBag className="h-5 w-5" /><span>Vendre un produit</span>
                    </button>
                    <button onClick={() => navigate('/post-service')} className="flex flex-col items-center gap-1 px-3 py-3 bg-gradient-to-br from-orange-400 to-yellow-400 text-white rounded-xl font-medium text-sm">
                      <Briefcase className="h-5 w-5" /><span>Proposer un service</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 my-2" />
                  <Link to="/profile" className="flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"><User className="h-5 w-5" /><span className="font-medium">{t.nav.profile}</span></Link>
                  <Link to="/transactions" className="flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"><Receipt className="h-5 w-5" /><span className="font-medium">Mes Transactions</span></Link>
                  {user?.isAdmin && <Link to="/admin" className="flex items-center space-x-3 px-3 py-3 rounded-xl text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 transition-colors"><ShieldCheck className="h-5 w-5" /><span>Dashboard Admin</span></Link>}
                  <div className="border-t border-gray-100 my-2" /><button onClick={handleLogout} className="flex items-center space-x-3 w-full text-left px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"><LogOut className="h-5 w-5" /><span className="font-medium">{t.nav.logout}</span></button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-1">
                  <Button variant="outline" onClick={() => navigate('/login')} className="w-full">{t.nav.login}</Button>
                  <Button onClick={() => navigate('/signup')} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white">{t.nav.signup}</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── BARRE DE NAVIGATION BAS — mobile uniquement ─── */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-6 h-16">

            <Link to="/" className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive('/') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>
              <Home className="h-5 w-5" /><span className="text-[10px] font-medium">Accueil</span>
            </Link>

            <Link to="/products" className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive('/products') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>
              <ShoppingBag className="h-5 w-5" /><span className="text-[10px] font-medium">Produits</span>
            </Link>

            {/* NOUVEAU : Services */}
            <Link to="/services" className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive('/services') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>
              <Briefcase className="h-5 w-5" /><span className="text-[10px] font-medium">Services</span>
            </Link>

            <div className="flex flex-col items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full shadow-lg -mt-4 text-white hover:from-orange-600 hover:to-yellow-600 transition-all active:scale-95">
                    <Plus className="h-6 w-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="mb-2 w-52">
                  <DropdownMenuItem onClick={() => navigate('/post-product')} className="py-3"><ShoppingBag className="h-4 w-4 mr-2 text-orange-500" />{t.nav.postProduct}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/post-service')} className="py-3"><Briefcase className="h-4 w-4 mr-2 text-orange-500" />{t.nav.postService}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-[10px] font-medium text-gray-500 mt-0.5">Publier</span>
            </div>

            <Link to="/messages" className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive('/messages') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>
              <div className="relative">
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </div>
              <span className="text-[10px] font-medium">Messages</span>
            </Link>

            <Link to="/profile" className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive('/profile') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>
              {user?.avatar ? <Avatar className="h-6 w-6 border border-orange-400"><AvatarImage src={getMediaUrl(user.avatar)} /><AvatarFallback className="text-[10px] bg-orange-100 text-orange-700">{user.firstName?.[0]}</AvatarFallback></Avatar> : <User className="h-5 w-5" />}
              <span className="text-[10px] font-medium">Profil</span>
            </Link>

          </div>
        </nav>
      )}
      {isAuthenticated && <div className="md:hidden h-16" />}
    </>
  );
};

export default Navbar;
