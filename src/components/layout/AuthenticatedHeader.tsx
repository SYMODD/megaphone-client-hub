import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
  const { signOut, profile, user } = useAuth();
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
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-3">
        <div className="flex justify-between items-center h-16">
          {/* Logo à gauche - aligné avec le menu */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Sud Megaphone</span>
            </Link>
          </div>
          
          {/* Tout à droite sur une ligne - responsive */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Version desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {profile?.prenom && profile?.nom ? `${profile.prenom} ${profile.nom}` : 
                 profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` :
                 user?.email?.split('@')[0] || 'Utilisateur'}
              </span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {formatOperationPoint(profile?.point_operation)}
              </span>
            </div>
            
            {/* Version mobile - tout dans le même conteneur aligné à droite */}
            <div className="lg:hidden flex items-center space-x-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-900">
                    {profile?.prenom && profile?.nom ? `${profile.prenom} ${profile.nom}` : 
                     profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` :
                     user?.email?.split('@')[0] || 'Utilisateur'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatOperationPoint(profile?.point_operation)}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Bouton desktop */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="hidden lg:flex text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});

AuthenticatedHeader.displayName = "AuthenticatedHeader";

export { AuthenticatedHeader };
