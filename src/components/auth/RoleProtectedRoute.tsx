
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
  const { profile, loading, user } = useAuth();

  // 🔍 DEBUG - Ajout de logs pour diagnostiquer le problème
  console.log('🔍 RoleProtectedRoute DEBUG:', {
    loading,
    hasProfile: !!profile,
    profileRole: profile?.role,
    allowedRoles,
    redirectTo,
    userEmail: user?.email,
    profileData: profile
  });

  if (loading) {
    console.log('🔄 RoleProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = profile && allowedRoles.includes(profile.role);
  
  if (!hasAccess) {
    console.log('❌ RoleProtectedRoute: Access DENIED', {
      reason: !profile ? 'No profile' : 'Role not allowed',
      currentRole: profile?.role,
      allowedRoles,
      redirectingTo: redirectTo
    });
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ RoleProtectedRoute: Access GRANTED');
  return <>{children}</>;
};
