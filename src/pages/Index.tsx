
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, FileText, Database, TrendingUp, User, MapPin } from "lucide-react";
import { ClientStats } from "@/components/dashboard/ClientStats";
import { NationalityChart } from "@/components/dashboard/NationalityChart";
import { RecentClients } from "@/components/dashboard/RecentClients";
import { RegistrationChart } from "@/components/dashboard/RegistrationChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RoleIndicator } from "@/components/dashboard/RoleIndicator";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { AdminFilters } from "@/components/dashboard/AdminFilters";
import { useAdminFilters } from "@/hooks/useAdminFilters";
import { useAgentData } from "@/hooks/useAgentData";

const Index = () => {
  const { user, profile } = useAuth();
  const adminFilters = useAdminFilters();

  console.log("User:", user);
  console.log("Profile:", profile);

  // Utiliser les filtres seulement pour admin et superviseur
  const shouldUseFilters = profile?.role === "admin" || profile?.role === "superviseur";
  const agentData = useAgentData(shouldUseFilters ? adminFilters.filters : undefined);

  // Rediriger les agents vers la page "Nouveau Client" - AFTER all hooks are called
  if (profile?.role === "agent") {
    return <Navigate to="/nouveau-client" replace />;
  }

  const getPointLabel = (point: string) => {
    const labels: Record<string, string> = {
      "aeroport_marrakech": "Aéroport Marrakech",
      "aeroport_casablanca": "Aéroport Casablanca", 
      "aeroport_agadir": "Aéroport Agadir",
      "navire_atlas": "Navire Atlas",
      "navire_meridien": "Navire Méridien",
      "agence_centrale": "Agence Centrale"
    };
    return labels[point] || point;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Sud Megaphone</h1>
          <p className="text-lg sm:text-xl text-slate-600">Client Manager Dashboard</p>
          <p className="text-slate-500">Connectez-vous pour accéder à l'application</p>
          <Link to="/auth">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            Sud Megaphone
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-4 sm:mb-6">
            Client Manager Dashboard
          </p>
          
          {/* Enhanced User Profile Card */}
          {profile && (
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-2xl shadow-xl p-1 max-w-lg mx-auto mb-6 sm:mb-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                      {profile.prenom} {profile.nom}
                    </h2>
                    <div className="flex justify-center sm:justify-start">
                      <RoleIndicator role={profile.role} size="lg" />
                    </div>
                  </div>
                </div>
                
                {profile.point_operation && profile.role === "agent" && (
                  <div className="flex items-center justify-center space-x-2 text-slate-600 bg-slate-50 rounded-lg px-3 sm:px-4 py-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium text-sm sm:text-base">{getPointLabel(profile.point_operation)}</span>
                  </div>
                )}
                
                <div className="text-xs text-slate-400 font-mono bg-slate-50 rounded px-2 py-1 break-all">
                  {user.email}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Gestion des clients
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Suivi en temps réel
            </Badge>
          </div>
        </div>

        {/* Admin Filters - Only show for admin and superviseur */}
        {shouldUseFilters && (
          <AdminFilters
            selectedPoint={adminFilters.selectedPoint}
            selectedCategory={adminFilters.selectedCategory}
            onPointChange={adminFilters.handlePointChange}
            onCategoryChange={adminFilters.handleCategoryChange}
            onClearFilters={adminFilters.clearFilters}
          />
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Overview */}
        <ClientStats />

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <NationalityChart />
          <RegistrationChart />
        </div>

        {/* Recent Activity */}
        <RecentClients />
      </main>
    </div>
  );
};

export default Index;
