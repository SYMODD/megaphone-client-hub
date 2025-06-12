
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, profileLoading } = useAuth();

  console.log("🔐 [PROTECTED_ROUTE] State check:", {
    hasUser: !!user,
    loading,
    profileLoading,
    timestamp: new Date().toISOString()
  });

  if (loading || profileLoading) {
    console.log("⏳ [PROTECTED_ROUTE] Loading state active");
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

  if (!user) {
    console.log("❌ [PROTECTED_ROUTE] User not authenticated, redirecting to /agent");
    return <Navigate to="/agent" replace />;
  }

  console.log("✅ [PROTECTED_ROUTE] User authenticated, rendering children");
  return <>{children}</>;
};
