
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const SmartRedirect = () => {
  const { user, profile, loading, profileLoading } = useAuth();

  console.log("🎯 [SMART_REDIRECT] State check:", {
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.role,
    loading,
    profileLoading,
    timestamp: new Date().toISOString()
  });

  // Show loading while checking auth state or loading profile
  if (loading || profileLoading) {
    console.log("⏳ [SMART_REDIRECT] Loading state active");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">
            {loading ? "Chargement..." : "Chargement du profil..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to agent login (default entry point)
  if (!user) {
    console.log("❌ [SMART_REDIRECT] No user found, redirecting to /agent");
    return <Navigate to="/agent" replace />;
  }

  // If user exists but profile is not loaded yet, show error
  if (!profile) {
    console.log("⚠️ [SMART_REDIRECT] User found but no profile loaded");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Profil non trouvé</h2>
          <p className="text-slate-600 mb-4">
            Votre profil utilisateur n'a pas pu être chargé.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  // Redirect based on user role with specific paths
  console.log("🚀 [SMART_REDIRECT] Redirecting user based on role:", profile.role);
  
  switch (profile.role) {
    case "admin":
      console.log("👑 [SMART_REDIRECT] Admin user detected, redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;
    case "superviseur":
      console.log("👨‍💼 [SMART_REDIRECT] Superviseur user detected, redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;
    case "agent":
      console.log("👤 [SMART_REDIRECT] Agent user detected, redirecting to /nouveau-client");
      return <Navigate to="/nouveau-client" replace />;
    default:
      console.log("❓ [SMART_REDIRECT] Unknown or invalid role:", profile.role, "redirecting to /agent");
      return <Navigate to="/agent" replace />;
  }
};
