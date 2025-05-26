
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const SignupRedirect = () => {
  const { user, loading } = useAuth();

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

  // Only admin can access signup page
  const isAdmin = user?.email === "essbane.salim@gmail.com";
  
  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  // If admin is logged in, redirect to auth page where they can access signup tab
  return <Navigate to="/auth" replace />;
};
