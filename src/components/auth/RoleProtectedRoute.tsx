
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
  redirectTo = "/nouveau-client" 
}: RoleProtectedRouteProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    console.log(`Access denied. User role: ${profile?.role}, Allowed roles: ${allowedRoles.join(', ')}, Redirecting to: ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
