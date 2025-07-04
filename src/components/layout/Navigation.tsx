import React, { memo, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Database, FileText, Shield, UserPlus, Menu, X, Search, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleIndicator } from "../dashboard/RoleIndicator";
import { AnimatedNavContainer, AnimatedNavItem, AnimatedMobileMenu, AnimatedMobileMenuItem } from "@/components/ui/animated-nav";

const Navigation = memo(() => {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === "admin" || user?.email?.toLowerCase() === "essbane.salim@gmail.com";
  const isAgent = profile?.role === "agent";
  
  // 🔍 DEBUG - Navigation role detection
  console.log('🧭 Navigation DEBUG:', {
    userEmail: user?.email?.toLowerCase(),
    profileRole: profile?.role,
    isAdmin,
    isAgent,
    profileData: profile
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items mémorisés pour éviter les recalculs
  const navigationItems = useMemo(() => {
    if (isAgent) {
      // Pour les agents : seulement nouveau client et contrats (PAS de sécurité)
      return [
        { to: "/nouveau-client", icon: Plus, label: "Nouveau Client", color: "from-green-500 to-emerald-600" },
        { to: "/contracts", icon: FileText, label: "Contrats", color: "from-purple-500 to-purple-600" }
      ];
    } else {
      // Pour admin et superviseur : accès complet
      const baseItems = [
        { to: "/", icon: Users, label: "Dashboard", color: "from-blue-500 to-blue-600" },
        { to: "/nouveau-client", icon: Plus, label: "Nouveau Client", color: "from-green-500 to-emerald-600" },
        { to: "/base-clients", icon: Database, label: "Base Clients", color: "from-blue-500 to-blue-600" },
        { to: "/audit-clients", icon: Search, label: "Audit Clients", color: "from-orange-500 to-orange-600" },
        { to: "/contracts", icon: FileText, label: "Contrats", color: "from-purple-500 to-purple-600" },
        { to: "/security", icon: Shield, label: "Sécurité", color: "from-red-500 to-red-600" },
      ];

      if (isAdmin) {
        baseItems.push({ to: "/users", icon: UserCog, label: "Gestion Utilisateurs", color: "from-indigo-500 to-indigo-600" });
      }

      return baseItems;
    }
  }, [isAgent, isAdmin]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-40" style={{ top: '64px' }}>
      <div className="container mx-auto px-3">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between py-3">
          <AnimatedNavContainer className="flex items-center space-x-2 overflow-x-auto">
            {navigationItems.map((item) => (
              <AnimatedNavItem key={item.to + item.label}>
                <Link to={item.to}>
                  <Button variant="ghost" size="sm" className="whitespace-nowrap hover:scale-105 transition-all duration-200 min-w-fit text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                    <div className={`w-4 h-4 mr-2 bg-gradient-to-r ${item.color} rounded p-0.5`}>
                      <item.icon className="w-full h-full text-white" />
                    </div>
                    {item.label}
                  </Button>
                </Link>
              </AnimatedNavItem>
            ))}
          </AnimatedNavContainer>
          
          {profile && (
            <div className="flex items-center">
              <RoleIndicator role={profile.role} size="sm" />
            </div>
          )}
        </div>

        {/* Mobile Navigation - Improved */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 hover:text-slate-900"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="ml-2 text-sm font-medium">Menu</span>
            </Button>
            
            {profile && (
              <RoleIndicator role={profile.role} size="sm" />
            )}
          </div>

          {/* Mobile Menu - Enhanced Grid Layout */}
          <AnimatedMobileMenu 
            isOpen={isMobileMenuOpen} 
            className="pb-4 space-y-3 border-t border-slate-100 mt-2 pt-4 animate-fade-in"
          >
            <div className="grid grid-cols-1 gap-3">
              {navigationItems.map((item) => (
                <AnimatedMobileMenuItem key={item.to + item.label} onClick={closeMobileMenu}>
                  <Link to={item.to}>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full justify-start h-auto p-4 hover:scale-[1.02] transition-all duration-200 bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md text-slate-800 hover:text-slate-900"
                    >
                      <div className={`w-10 h-10 mr-4 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-md`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-base font-semibold text-slate-800">{item.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.label === "Dashboard" && "Vue d'ensemble"}
                          {item.label === "Nouveau Client" && "Ajouter un client"}
                          {item.label === "Base Clients" && "Consulter la liste"}
                          {item.label === "Audit Clients" && "Vérifier les données"}
                          {item.label === "Contrats" && "Générer PDF"}
                          {item.label === "Sécurité" && "Gérer la sécurité"}
                          {item.label === "Gestion Utilisateurs" && "Administration"}
                        </div>
                      </div>
                    </Button>
                  </Link>
                </AnimatedMobileMenuItem>
              ))}
            </div>
          </AnimatedMobileMenu>
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = "Navigation";

export { Navigation };
