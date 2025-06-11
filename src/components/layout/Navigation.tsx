
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  FileText,
  Shield,
  ScanLine
} from "lucide-react";

export const Navigation = () => {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {/* Navigation commune */}
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
              isActive("/dashboard") 
                ? "text-blue-700 bg-blue-50" 
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          {/* Navigation spécifique aux rôles */}
          {profile.role === "agent" && (
            <>
              <Link
                to="/nouveau-client"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                  isActive("/nouveau-client") 
                    ? "text-blue-700 bg-blue-50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau client</span>
                <span className="sm:hidden">Nouveau</span>
              </Link>
              <Link
                to="/scanner-auto"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                  isActive("/scanner-auto") 
                    ? "text-blue-700 bg-blue-50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <ScanLine className="w-4 h-4" />
                <span className="hidden sm:inline">Scanner auto</span>
                <span className="sm:hidden">Scanner</span>
              </Link>
            </>
          )}

          {(profile.role === "admin" || profile.role === "superviseur") && (
            <>
              <Link
                to="/clients"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                  isActive("/clients") 
                    ? "text-blue-700 bg-blue-50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <Users className="w-4 h-4" />
                Clients
              </Link>
              <Link
                to="/contracts"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                  isActive("/contracts") 
                    ? "text-blue-700 bg-blue-50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <FileText className="w-4 h-4" />
                Contrats
              </Link>
            </>
          )}

          {profile.role === "admin" && (
            <>
              <Link
                to="/users"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                  isActive("/users") 
                    ? "text-blue-700 bg-blue-50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Utilisateurs</span>
                <span className="sm:hidden">Users</span>
              </Link>
              <Link
                to="/admin/recaptcha"
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors",
                  isActive("/admin/recaptcha") 
                    ? "text-red-700 bg-red-50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">reCAPTCHA</span>
                <span className="sm:hidden">Security</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
