
import React from "react";
import { AuthenticatedHeader } from "./AuthenticatedHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

          {/* Bouton connexion - redirige vers agent */}
          <div className="flex items-center space-x-3">
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
