
import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Helper pour formater le nom du point d'opération
const formatOperationPoint = (pointOperation: string | undefined): string => {
  if (!pointOperation) return "Non défini";
  
  const pointLabels: Record<string, string> = {
    "aeroport_marrakech": "Aéroport Marrakech",
    "aeroport_casablanca": "Aéroport Casablanca", 
    "aeroport_agadir": "Aéroport Agadir",
    "aeroport_rabat": "Aéroport Rabat",
    "aeroport_fes": "Aéroport Fès",
    "aeroport_nador": "Aéroport Nador",
    "aeroport_oujda": "Aéroport Oujda",
    "aeroport_tanger": "Aéroport Tanger",
    "navire_atlas": "Navire Atlas",
    "navire_meridien": "Navire Méridien",
    "agence_centrale": "Agence Centrale"
  };
  
  return pointLabels[pointOperation] || pointOperation;
};

const AuthenticatedHeader = memo(() => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Stocker le rôle avant la déconnexion pour redirection
    const userRole = profile?.role;
    
    await signOut();
    
    // Rediriger vers la page de connexion spécifique au rôle
    switch (userRole) {
      case "admin":
        navigate("/admin");
        break;
      case "superviseur":
        navigate("/superviseur");
        break;
      case "agent":
        navigate("/agent");
        break;
      default:
        navigate("/agent"); // Par défaut, rediriger vers agent
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-xl font-bold text-slate-800">Sud Megaphone</span>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {profile && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-slate-600">
                {/* Info utilisateur */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium truncate max-w-[100px] sm:max-w-none">
                    {profile.prenom} {profile.nom}
                  </span>
                </div>
                
                {/* Point d'opération - visible sur mobile aussi */}
                {profile.point_operation && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {formatOperationPoint(profile.point_operation)}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});

AuthenticatedHeader.displayName = "AuthenticatedHeader";

export { AuthenticatedHeader };
