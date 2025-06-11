
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  FileText, 
  Settings,
  Shield,
  ScanLine 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const { profile } = useAuth();
  const location = useLocation();

  // Check if current user is admin
  const isAdmin = profile?.role === "admin";
  const isSupervisor = profile?.role === "superviseur";
  const canManageUsers = isAdmin || isSupervisor;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center space-x-1">
          <Button
            variant={isActive("/dashboard") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </Button>

          <Button
            variant={isActive("/nouveau-client") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/nouveau-client" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Nouveau Client</span>
            </Link>
          </Button>

          <Button
            variant={isActive("/base-clients") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/base-clients" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Base Clients</span>
            </Link>
          </Button>

          <Button
            variant={isActive("/contrats") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/contrats" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Contrats</span>
            </Link>
          </Button>

          {canManageUsers && (
            <Button
              variant={isActive("/gestion-utilisateurs") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/gestion-utilisateurs" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Gestion Utilisateurs</span>
              </Link>
            </Button>
          )}

          {isAdmin && (
            <Button
              variant={isActive("/recaptcha-settings") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/recaptcha-settings" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>reCAPTCHA</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
