import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '../lib/media';
import { Users, ShoppingBag, Flag, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getReports()
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données admin', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await adminAPI.resolveReport(reportId);
      toast({ title: 'Réussi', description: 'Le signalement a été résolu.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la résolution', variant: 'destructive' });
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      toast({ title: 'Vérifié !', description: 'L\'utilisateur a été vérifié.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la vérification', variant: 'destructive' });
    }
  };

  const handleWarnUser = async (userId) => {
    try {
      await adminAPI.warnUser(userId);
      toast({ title: 'Averti !', description: 'L\'utilisateur a été averti.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de l\'avertissement', variant: 'destructive' });
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await adminAPI.banUser(userId);
      toast({ title: 'Banni !', description: 'L\'utilisateur a été banni.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec du bannissement', variant: 'destructive' });
    }
  };

  const handleWarnAndResolve = async (report) => {
    try {
      // Warn the reported user (use reportedUserId if available, else targetId)
      const userIdToWarn = report.reportedUserId || report.targetId;
      await adminAPI.warnUser(userIdToWarn);
      // Also resolve the report
      await adminAPI.resolveReport(report.id);
      toast({ title: 'Averti !', description: 'Un avertissement a été envoyé et le signalement résolu.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de l\'avertissement', variant: 'destructive' });
    }
  };

  const handleBanAndResolve = async (report) => {
    try {
      const userIdToBan = report.reportedUserId || report.targetId;
      await adminAPI.banUser(userIdToBan);
      await adminAPI.resolveReport(report.id);
      toast({ title: 'Banni !', description: 'L\'utilisateur a été banni et le signalement résolu.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec du bannissement', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement du dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-gray-600">Gérez la sécurité et la qualité de Jënd-Ak-Jaay</p>
          </div>
          <Button variant="outline" onClick={fetchData}>Actualiser</Button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Utilisateurs" value={stats?.users} icon={<Users className="text-blue-600" />} />
          <StatCard title="Produits" value={stats?.products} icon={<ShoppingBag className="text-orange-600" />} />
          <StatCard title="Transactions" value={stats?.transactions} icon={<CheckCircle className="text-green-600" />} />
          <StatCard title="Signalements Actifs" value={stats?.reports} icon={<Flag className="text-red-600" />} />
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-white border-b p-1 inline-flex w-full md:w-auto">
            <TabsTrigger value="reports" className="px-8">
              <Flag className="h-4 w-4 mr-2" />
              Signalements ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="users" className="px-8">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Validation Vendeurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed">Aucun signalement en attente.</p>
            ) : (
              reports.map(report => (
                <Card key={report.id} className={`border-l-4 ${report.status === 'resolved' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={report.status === 'resolved' ? 'outline' : 'destructive'}>
                          {report.status === 'resolved' ? 'Résolu' : 'En attente'}
                        </Badge>
                        <span className="text-xs text-gray-500">Par {report.reporterName}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Raison: {report.reason}</h3>
                      <p className="text-sm text-gray-600 italic">"{report.description}"</p>
                      <p className="text-xs font-medium text-blue-600">Type: {report.targetType} | ID: {report.targetId}</p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleResolveReport(report.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Ignorer
                        </Button>
                        <Button size="sm" variant="outline" className="text-orange-600 border-orange-200" onClick={() => handleWarnAndResolve(report)}>
                          <AlertTriangle className="h-4 w-4 mr-1" /> Avertir
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleBanAndResolve(report)}>
                          Bannir
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats?.unverifiedUsersList?.map(user => (
                <Card key={user.id} className="border-2 border-gray-100 hover:border-blue-200 transition-all">
                  <CardContent className="p-6 text-center space-y-4">
                      <Avatar className="h-20 w-20 mx-auto border-2 border-white shadow-md">
                      <AvatarImage src={getMediaUrl(user.avatar)} />
                      <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">{user.location}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleVerifyUser(user.id)}>
                        <ShieldCheck className="h-4 w-4 mr-2" /> Valider le vendeur
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => handleWarnUser(user.id)}>
                          Avertir
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={() => handleBanUser(user.id)}>
                          Bannir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!stats?.unverifiedUsersList || stats.unverifiedUsersList.length === 0) && (
                 <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed">
                   Tous les vendeurs actifs sont déjà vérifiés !
                 </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <Card>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 bg-gray-100 rounded-xl">{icon}</div>
    </CardContent>
  </Card>
);

export default AdminDashboard;
