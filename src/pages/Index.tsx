
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
import { Navigate } from "react-router-dom";
import { AdminFilters } from "@/components/dashboard/AdminFilters";
import { useAdminFilters } from "@/hooks/useAdminFilters";
import { useAgentData } from "@/hooks/useAgentData";

const Index = () => {
  const { user, profile, loading } = useAuth();

  console.log("Dashboard - User:", user);
  console.log("Dashboard - Profile:", profile);
  console.log("Dashboard - Loading:", loading);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Early return for unauthenticated users - redirect to agent login
  if (!user) {
    console.log("No user found, redirecting to /agent");
    return <Navigate to="/agent" replace />;
  }

  // Attendre que le profil soit chargé avant de faire des redirections
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  console.log("Profile role:", profile.role);

  // Redirect agents to their specific page
  if (profile.role === "agent") {
    console.log("Agent detected, redirecting to /nouveau-client");
    return <Navigate to="/nouveau-client" replace />;
  }

  // Only admin and superviseur can access the dashboard
  if (profile.role !== "admin" && profile.role !== "superviseur") {
    console.log(`Role ${profile.role} not allowed on dashboard, redirecting to /agent`);
    return <Navigate to="/agent" replace />;
  }

  console.log("User authorized for dashboard, loading components...");

  // Now we can safely call hooks since we know we're not redirecting
  const adminFilters = useAdminFilters();

  // Use the filters only for admin and superviseur
  const isAdminOrSuperviseur = profile.role === "admin" || profile.role === "superviseur";
  const agentData = useAgentData(isAdminOrSuperviseur ? adminFilters.filters : undefined);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 py-4 space-y-6 max-w-7xl">
        {/* Welcome Section - Mobile First */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Sud Megaphone
            </h1>
            <p className="text-base text-slate-600">
              Client Manager Dashboard
            </p>
          </div>
          
          {/* Enhanced User Profile Card - Mobile Optimized */}
          <Card className="max-w-md mx-auto bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    {profile.prenom} {profile.nom}
                  </h2>
                  <RoleIndicator role={profile.role} size="lg" />
                </div>
                
                {profile.point_operation && (
                  <div className="flex items-center space-x-2 text-slate-600 bg-slate-100 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">{getPointLabel(profile.point_operation)}</span>
                  </div>
                )}
                
                <div className="text-xs text-slate-400 font-mono bg-slate-100 rounded px-2 py-1 break-all">
                  {user.email}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-2">
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

        {/* Admin Filters - Improved Mobile Layout */}
        {isAdminOrSuperviseur && (
          <div className="max-w-4xl mx-auto">
            <AdminFilters
              selectedPoint={adminFilters.selectedPoint}
              selectedCategory={adminFilters.selectedCategory}
              onPointChange={adminFilters.handlePointChange}
              onCategoryChange={adminFilters.handleCategoryChange}
              onClearFilters={adminFilters.clearFilters}
            />
          </div>
        )}

        {/* Quick Actions - Enhanced Mobile Experience */}
        <div className="max-w-4xl mx-auto">
          <QuickActions />
        </div>

        {/* Stats Overview - Mobile Optimized Grid */}
        <div className="max-w-6xl mx-auto">
          <ClientStats data={agentData} />
        </div>

        {/* Charts and Analytics - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <NationalityChart data={agentData} />
          <RegistrationChart data={agentData} />
        </div>

        {/* Recent Activity - Full Width on Mobile */}
        <div className="max-w-6xl mx-auto">
          <RecentClients data={agentData} />
        </div>
      </main>
    </div>
  );
};

export default Index;
