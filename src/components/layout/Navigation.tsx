
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Database, FileText, Shield, UserPlus, Eye, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleIndicator } from "../dashboard/RoleIndicator";
import { useState } from "react";

export const Navigation = () => {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === "admin" || user?.email?.toLowerCase() === "essbane.salim@gmail.com";
  const isAgent = profile?.role === "agent";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation différente selon le rôle
  let navigationItems = [];

  if (isAgent) {
    // Pour les agents : seulement nouveau client et contrats
    navigationItems = [
      { to: "/", icon: Users, label: "Dashboard" },
      { to: "/nouveau-client", icon: Plus, label: "Nouveau Client" },
      { to: "/contrats", icon: FileText, label: "Contrats" }
    ];
  } else {
    // Pour admin et superviseur : accès complet
    navigationItems = [
      { to: "/", icon: Users, label: "Dashboard" },
      { to: "/nouveau-client", icon: Plus, label: "Nouveau Client" },
      { to: "/base-clients", icon: Database, label: "Base Clients" },
      { to: "/contrats", icon: FileText, label: "Contrats" },
      ...(isAdmin ? [
        { to: "/gestion-utilisateurs", icon: Shield, label: "Gestion Utilisateurs" },
        { to: "/gestion-utilisateurs", icon: UserPlus, label: "Créer utilisateur" }
      ] : [])
    ];
  }

  return (
    <nav className="bg-white border-b border-slate-100">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-2">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link key={item.to + item.label} to={item.to}>
                <Button variant="ghost" size="sm" className="whitespace-nowrap">
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          
          {profile && (
            <div className="flex items-center">
              <RoleIndicator role={profile.role} size="sm" />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {profile && (
              <RoleIndicator role={profile.role} size="sm" />
            )}
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="pb-3 space-y-1 border-t border-slate-100 mt-2 pt-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.to + item.label} 
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
