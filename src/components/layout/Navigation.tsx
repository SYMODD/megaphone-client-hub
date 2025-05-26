
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Database, FileText, Shield, UserPlus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "superviseur":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "agent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "superviseur":
        return <Eye className="w-3 h-3" />;
      case "agent":
        return <Users className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "superviseur":
        return "Superviseur";
      case "agent":
        return "Agent";
      default:
        return role;
    }
  };

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
              <Badge 
                variant="outline" 
                className={`px-2 py-1 text-xs font-medium border ${getRoleColor(profile.role)}`}
              >
                <span className="flex items-center gap-1">
                  {getRoleIcon(profile.role)}
                  {getRoleLabel(profile.role)}
                </span>
              </Badge>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
