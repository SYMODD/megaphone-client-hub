
import React from "react";
import { AuthenticatedHeader } from "./AuthenticatedHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Eye, Users } from "lucide-react";

export const Header = () => {
  const { user } = useAuth();

  if (user) {
    return <AuthenticatedHeader />;
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-xl font-bold text-slate-800">Sud Megaphone</span>
          </Link>

          {/* Actions de connexion par rôle */}
          <div className="flex items-center space-x-3">
            {/* Liens rapides par rôle - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link to="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">Admin</span>
                </Button>
              </Link>
              <Link to="/superviseur">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-600">Superviseur</span>
                </Button>
              </Link>
              <Link to="/agent">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">Agent</span>
                </Button>
              </Link>
            </div>

            {/* Bouton connexion général redirigeant vers agent */}
            <Link to="/agent">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
