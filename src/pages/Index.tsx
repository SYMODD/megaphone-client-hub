
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AdminFilters } from "@/components/dashboard/AdminFilters";
import { DateFilters } from "@/components/dashboard/DateFilters";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { useAdminFilters } from "@/hooks/useAdminFilters";
import { useAgentData } from "@/hooks/useAgentData";

const Index = () => {
  const { user, profile, loading } = useAuth();

  console.log("Dashboard Index - User:", !!user, "Profile:", profile?.role, "Loading:", loading);

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

  // If not authenticated, redirect to agent login
  if (!user) {
    console.log("No user found, redirecting to /agent");
    return <Navigate to="/agent" replace />;
  }

  // Wait for profile to load before making redirections
  if (!profile) {
    console.log("Profile is loading...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  console.log("Profile role verified:", profile.role);

  // Only redirect agents - admin and superviseur should stay on dashboard
  if (profile.role === "agent") {
    console.log("Agent detected, redirecting to /nouveau-client");
    return <Navigate to="/nouveau-client" replace />;
  }

  // Ensure only admin and superviseur can access the dashboard
  if (profile.role !== "admin" && profile.role !== "superviseur") {
    console.log(`Unauthorized role ${profile.role}, redirecting to /nouveau-client`);
    return <Navigate to="/nouveau-client" replace />;
  }

  console.log("User authorized for dashboard, role:", profile.role);

  // Now we can safely call hooks since we know we're not redirecting
  const adminFilters = useAdminFilters();

  // Use the filters only for admin and superviseur
  const isAdminOrSuperviseur = profile.role === "admin" || profile.role === "superviseur";
  const agentData = useAgentData(isAdminOrSuperviseur ? adminFilters.filters : undefined);

  // Debug pour vérifier que les données arrivent bien
  console.log("🎯 DASHBOARD - Données reçues:", {
    totalClients: agentData.totalClients,
    nationalityData: agentData.nationalityData.length,
    registrationData: agentData.registrationData.length,
    recentClients: agentData.recentClients.length,
    filters: adminFilters.filters,
    loading: agentData.loading,
    userRole: profile.role
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 py-4 space-y-6 max-w-7xl">
        {/* Welcome Section - Mobile First */}
        <WelcomeSection profile={profile} userEmail={user.email} />

        {/* Admin Filters - Improved Mobile Layout */}
        {isAdminOrSuperviseur && (
          <div className="max-w-4xl mx-auto space-y-4">
            <AdminFilters
              selectedPoint={adminFilters.selectedPoint}
              selectedCategory={adminFilters.selectedCategory}
              onPointChange={adminFilters.handlePointChange}
              onCategoryChange={adminFilters.handleCategoryChange}
              onClearFilters={adminFilters.clearFilters}
            />
            
            <DateFilters
              dateRange={adminFilters.dateRange}
              onDateRangeChange={adminFilters.handleDateRangeChange}
            />
          </div>
        )}

        {/* Quick Actions - Enhanced Mobile Experience */}
        <div className="max-w-4xl mx-auto">
          <QuickActions />
        </div>

        {/* Dashboard Statistics */}
        {agentData.loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <DashboardStats agentData={agentData} />
        )}
      </main>
    </div>
  );
};

export default Index;
