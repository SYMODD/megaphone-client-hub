
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Database, FileText, Shield, UserPlus, Menu, X } from "lucide-react";
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
    // Pour les agents : seulement nouveau client et contrats (sans dashboard)
    navigationItems = [
      { to: "/nouveau-client", icon: Plus, label: "Nouveau Client", color: "from-green-500 to-emerald-600" },
      { to: "/contrats", icon: FileText, label: "Contrats", color: "from-purple-500 to-purple-600" }
    ];
  } else {
    // Pour admin et superviseur : accès complet
    navigationItems = [
      { to: "/", icon: Users, label: "Dashboard", color: "from-blue-500 to-blue-600" },
      { to: "/nouveau-client", icon: Plus, label: "Nouveau Client", color: "from-green-500 to-emerald-600" },
      { to: "/base-clients", icon: Database, label: "Base Clients", color: "from-blue-500 to-blue-600" },
      { to: "/contrats", icon: FileText, label: "Contrats", color: "from-purple-500 to-purple-600" },
      ...(isAdmin ? [
        { to: "/gestion-utilisateurs", icon: Shield, label: "Gestion Utilisateurs", color: "from-red-500 to-red-600" },
      ] : [])
    ];
  }

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between py-3">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => (
              <Link key={item.to + item.label} to={item.to}>
                <Button variant="ghost" size="sm" className="whitespace-nowrap hover:scale-105 transition-all duration-200">
                  <div className={`w-4 h-4 mr-2 bg-gradient-to-r ${item.color} rounded p-0.5`}>
                    <item.icon className="w-full h-full text-white" />
                  </div>
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

        {/* Tablet Navigation */}
        <div className="hidden md:flex lg:hidden items-center justify-between py-2">
          <div className="flex items-center space-x-1 flex-wrap gap-1">
            {navigationItems.slice(0, 4).map((item) => (
              <Link key={item.to + item.label} to={item.to}>
                <Button variant="ghost" size="sm" className="text-xs px-2 py-1">
                  <item.icon className="w-3 h-3 mr-1" />
                  {item.label.split(' ')[0]}
                </Button>
              </Link>
            ))}
          </div>
          
          {profile && (
            <RoleIndicator role={profile.role} size="sm" />
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="ml-2 text-sm">Menu</span>
            </Button>
            
            {profile && (
              <RoleIndicator role={profile.role} size="sm" />
            )}
          </div>

          {/* Mobile Menu Déroulant */}
          {isMobileMenuOpen && (
            <div className="pb-4 space-y-2 border-t border-slate-100 mt-2 pt-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.to + item.label} 
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start h-auto p-3 hover:scale-105 transition-all duration-200"
                    >
                      <div className={`w-8 h-8 mr-3 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{item.label}</div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
