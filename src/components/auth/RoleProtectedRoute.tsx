
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/" 
}: RoleProtectedRouteProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // SÉCURITÉ RENFORCÉE : Vérification stricte des rôles
  if (!profile || !allowedRoles.includes(profile.role)) {
    console.warn(`🚨 [SECURITY] Accès refusé - Rôle ${profile?.role || 'undefined'} non autorisé pour ${allowedRoles.join(', ')}`);
    
    // Redirection intelligente selon le rôle
    if (profile?.role === "agent") {
      return <Navigate to="/nouveau-client" replace />;
    } else if (profile?.role === "admin" || profile?.role === "superviseur") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/login/agent" replace />;
    }
  }

  return <>{children}</>;
};
