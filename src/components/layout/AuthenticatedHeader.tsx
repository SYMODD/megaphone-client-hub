
import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
          <div className="flex items-center space-x-4">
            {profile && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{profile.prenom} {profile.nom}</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {profile.role}
                </span>
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
