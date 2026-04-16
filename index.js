import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionsAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ShoppingCart, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle, RefreshCw, Star } from 'lucide-react';
import RatingDialog from '../components/RatingDialog';
import { toast } from '../hooks/use-toast';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Payée (Séquestre)', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  shipped: { label: "En cours d'envoi", color: 'bg-indigo-100 text-indigo-800', icon: RefreshCw },
  delivered: { label: 'Livrée (En attente confirmation)', color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { label: 'Terminée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Remboursée', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
};

const TransactionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, purchases, sales
  const [ratingTarget, setRatingTarget] = useState(null); // { id, type, name }
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionsAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRating = (id, type, name, itemId, itemType, itemName) => {
    setRatingTarget({ id, type, name, itemId, itemType, itemName });
    setShowRatingDialog(true);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await transactionsAPI.updateStatus(id, newStatus);
      toast({ title: 'Statut mis à jour', description: `La commande est maintenant : ${statusConfig[newStatus].label}` });
      fetchTransactions();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    }
  };

  const confirmDelivery = async (id) => {
    try {
      await transactionsAPI.confirmDelivery(id);
      toast({ title: 'Livraison confirmée', description: "L'acheteur a été notifié." });
      fetchTransactions();
    } catch (error) {
       toast({ title: 'Erreur', description: 'Échec de la confirmation', variant: 'destructive' });
    }
  };

  const acceptTransaction = async (id) => {
    try {
      await transactionsAPI.accept(id);
      toast({ title: 'Commande acceptée', description: "L'acheteur a été notifié." });
      fetchTransactions();
    } catch { toast({ title: 'Erreur', description: 'Échec', variant: 'destructive' }); }
  };

  const rejectTransaction = async (id) => {
    if (!window.confirm('Refuser cette commande ?')) return;
    try {
      await transactionsAPI.reject(id);
      toast({ title: 'Commande refusée', description: "L'acheteur a été notifié." });
      fetchTransactions();
    } catch { toast({ title: 'Erreur', description: 'Échec', variant: 'destructive' }); }
  };

  const confirmReceipt = async (id) => {
    try {
      await transactionsAPI.confirmReceipt(id);
      toast({ title: 'Réception confirmée', description: 'Transaction terminée. Merci !' });
      fetchTransactions();
    } catch (error) {
       toast({ title: 'Erreur', description: 'Échec de la confirmation', variant: 'destructive' });
    }
  };

  const filtered = transactions.filter((tx) => {
    if (filter === 'purchases') return tx.buyerId === user?.id;
    if (filter === 'sales') return tx.sellerId === user?.id;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Transactions</h1>
          <p className="text-gray-600">Historique de vos achats et ventes</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'purchases', label: '🛒 Mes Achats' },
            { key: 'sales', label: '💰 Mes Ventes' }
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              className={filter === f.key ? 'bg-orange-500 hover:bg-orange-600' : ''}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune transaction</h3>
            <p className="text-gray-600 mb-4">Vos achats et ventes apparaîtront ici</p>
            <Button onClick={() => navigate('/products')} className="bg-orange-500 hover:bg-orange-600">
              Découvrir les produits
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((tx) => {
              // DÉFINITIONS CRITIQUES
              const isBuyer = tx.buyerId === user?.id;
              const isSeller = tx.sellerId === user?.id; 
              const status = statusConfig[tx.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={tx.id} className="border-2 border-gray-100 hover:border-orange-200 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isBuyer ? 'bg-red-100' : 'bg-green-100'}`}>
                          {isBuyer ?
                            <ArrowUpRight className="h-6 w-6 text-red-600" /> :
                            <ArrowDownLeft className="h-6 w-6 text-green-600" />
                          }
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tx.itemTitle}</h3>
                          <p className="text-sm text-gray-500">
                            {isBuyer ? `Acheté à ${tx.sellerName}` : `Vendu à ${tx.buyerName}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {' • '}
                            {tx.paymentMethod === 'wave' ? 'Wave' : tx.paymentMethod === 'orange_money' ? 'Orange Money' : 'Espèces'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${isBuyer ? 'text-red-600' : 'text-green-600'}`}>
                          {isBuyer ? '-' : '+'}{tx.amount.toLocaleString()} FCFA
                        </p>
                        <Badge className={`${status.color} mt-1`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>

                    {/* SECTION DES ACTIONS ET PROGRESSION */}
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      
                      {/* 1. Barre de progression (Visible pour l'Acheteur ET le Vendeur) */}
                      {!['cancelled','rejected','refunded'].includes(tx.status) && (
                        <div className="w-full mt-2 mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            {['pending','accepted','shipped','delivered','completed'].map((s, i) => (
                              <span key={s} className={['pending','accepted','shipped','delivered','completed'].indexOf(tx.status) >= i ? 'text-orange-600 font-semibold' : ''}>
                                {['Commandé','Accepté','Envoyé','Livré','Terminé'][i]}
                              </span>
                            ))}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full transition-all" style={{width: `${(['pending','accepted','shipped','delivered','completed'].indexOf(tx.status) + 1) * 20}%`}}></div>
                          </div>
                        </div>
                      )}

                      {/* 2. Contrôles spécifiques au VENDEUR */}
                      {isSeller && (
                        <div className="flex flex-wrap gap-2">
                          {(tx.status === 'pending' || tx.status === 'paid') && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => acceptTransaction(tx.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Accepter
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => rejectTransaction(tx.id)}>
                                <XCircle className="h-4 w-4 mr-1" /> Refuser
                              </Button>
                            </>
                          )}
                          {(tx.status === 'accepted') && (
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => updateStatus(tx.id, 'shipped')}>
                              Marquer comme envoyé
                            </Button>
                          )}
                          {tx.status === 'shipped' && (
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => confirmDelivery(tx.id)}>
                              Confirmer la livraison
                            </Button>
                          )}
                        </div>
                      )}

                      {/* 3. Contrôles spécifiques à l'ACHETEUR (CLIENT) */}
                      {isBuyer && (
                        <div className="flex flex-wrap gap-2">
                          {tx.status === 'delivered' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => confirmReceipt(tx.id)}>
                              Confirmer la réception (Libérer les fonds)
                            </Button>
                          )}
                          {tx.status === 'pending' && (
                             <p className="text-sm text-orange-600 italic">En attente de confirmation du vendeur...</p>
                          )}
                        </div>
                      )}

                      {/* 4. Système de notation (Visible une fois terminé) */}
                      {tx.status === 'completed' && (
                        <div className="flex flex-wrap gap-2 w-full mt-2">
                          {isBuyer ? (
                            <>
                              <Button size="sm" variant="outline" className="text-xs hover:bg-orange-50 border-orange-200" onClick={() => openRating(tx.itemId, tx.itemType, tx.itemTitle)}>
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" /> Noter le produit
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs hover:bg-orange-50 border-orange-200" onClick={() => openRating(tx.sellerId, 'user', tx.sellerName, tx.itemId, tx.itemType, tx.itemTitle)}>
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" /> Noter le vendeur
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs hover:bg-orange-50 border-orange-200" onClick={() => openRating(tx.buyerId, 'user', tx.buyerName)}>
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" /> Noter l'acheteur
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {ratingTarget && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          itemId={ratingTarget?.itemId}
          itemType={ratingTarget?.itemType}
          itemName={ratingTarget?.itemName}
          targetId={ratingTarget.id}
          targetType={ratingTarget.type}
          targetName={ratingTarget.name}
          itemId={ratingTarget.itemId}
          itemType={ratingTarget.itemType}
          itemName={ratingTarget.itemName}
          onSuccess={() => {
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
};

export default TransactionsPage;