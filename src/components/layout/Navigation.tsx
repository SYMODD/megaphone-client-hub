
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Database, FileText, Shield, UserPlus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleIndicator } from "../dashboard/RoleIndicator";

export const Navigation = () => {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";

  return (
    <nav className="bg-white border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <Link to="/">
              <Button variant="ghost" size="sm" className="whitespace-nowrap">
                <Users className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/nouveau-client">
              <Button variant="ghost" size="sm" className="whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Client
              </Button>
            </Link>
            <Link to="/base-clients">
              <Button variant="ghost" size="sm" className="whitespace-nowrap">
                <Database className="w-4 h-4 mr-2" />
                Base Clients
              </Button>
            </Link>
            <Link to="/contrats">
              <Button variant="ghost" size="sm" className="whitespace-nowrap">
                <FileText className="w-4 h-4 mr-2" />
                Contrats
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Link to="/gestion-utilisateurs">
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    <Shield className="w-4 h-4 mr-2" />
                    Gestion Utilisateurs
                  </Button>
                </Link>
                <Link to="/gestion-utilisateurs">
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer un utilisateur
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {profile && (
            <div className="flex items-center">
              <RoleIndicator role={profile.role} size="sm" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
