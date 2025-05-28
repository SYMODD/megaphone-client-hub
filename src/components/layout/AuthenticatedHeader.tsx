
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RoleIndicator } from "../dashboard/RoleIndicator";
import { useState } from "react";

export const AuthenticatedHeader = () => {
  const { profile, signOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Sign out error:", error);
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
    <header className="bg-white/98 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et titre - Optimisé mobile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Sud Megaphone</h1>
              <Badge variant="secondary" className="px-2 py-0 text-xs w-fit">
                Client Manager
              </Badge>
            </div>
          </div>

          {/* Desktop: Profil et déconnexion */}
          <div className="hidden md:flex items-center space-x-4">
            {profile ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {profile.prenom} {profile.nom}
                  </p>
                  <div className="flex items-center justify-end space-x-2 text-xs text-slate-600">
                    <RoleIndicator role={profile.role} size="sm" />
                    {profile.point_operation && profile.role !== "admin" && (
                      <>
                        <span>•</span>
                        <span className="text-xs truncate max-w-32">{getPointLabel(profile.point_operation)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-blue-200 flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            ) : (
              <RoleIndicator role="agent" size="sm" />
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>

          {/* Mobile: Menu burger optimisé */}
          <div className="md:hidden flex items-center space-x-2">
            {profile && (
              <RoleIndicator role={profile.role} size="sm" />
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile - Interface améliorée */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 space-y-4 animate-fade-in">
            {profile && (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-blue-200 flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {profile.prenom} {profile.nom}
                  </p>
                  {profile.point_operation && profile.role !== "admin" && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {getPointLabel(profile.point_operation)}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="w-full justify-center space-x-2 py-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Déconnexion</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
