
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Shield, Users, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const AuthenticatedHeader = () => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "superviseur":
        return "Superviseur";
      case "agent":
        return "Agent";
      default:
        return role;
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
        return <User className="w-3 h-3" />;
    }
  };

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

  const getPointLabel = (point: string) => {
    const labels: Record<string, string> = {
      "aeroport_marrakech": "Aéroport Marrakech",
      "aeroport_casablanca": "Aéroport Casablanca", 
      "aeroport_agadir": "Aéroport Agadir",
      "navire_atlas": "Navire Atlas",
      "navire_meridien": "Navire Méridien",
      "agence_centrale": "Agence Centrale"
    };
    return labels[point] || point;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">Sud Megaphone</h1>
            <Badge variant="secondary" className="px-2 py-1">
              Client Manager
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            {profile && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">
                    {profile.prenom} {profile.nom}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Badge 
                      variant="outline" 
                      className={`px-2 py-0.5 text-xs font-medium border ${getRoleColor(profile.role)}`}
                    >
                      <span className="flex items-center gap-1">
                        {getRoleIcon(profile.role)}
                        {getRoleLabel(profile.role)}
                      </span>
                    </Badge>
                    <span>•</span>
                    <span>{getPointLabel(profile.point_operation)}</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
