
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface RoleLink {
  role: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

const roleLinks: RoleLink[] = [
  {
    role: "admin",
    title: "Administrateur",
    description: "Accès complet au système de gestion",
    icon: Shield,
    color: "text-red-600",
    bgGradient: "from-red-500 to-red-600"
  },
  {
    role: "superviseur", 
    title: "Superviseur",
    description: "Supervision et gestion des agents",
    icon: Eye,
    color: "text-purple-600",
    bgGradient: "from-purple-500 to-purple-600"
  },
  {
    role: "agent",
    title: "Agent",
    description: "Gestion des clients et contrats",
    icon: Users,
    color: "text-blue-600",
    bgGradient: "from-blue-500 to-blue-600"
  }
];

export const RoleLoginLinks = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Choisissez votre type de connexion
        </h2>
        <p className="text-slate-600">
          Sélectionnez le type de compte qui correspond à votre rôle
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {roleLinks.map((roleLink) => (
          <Link 
            key={roleLink.role}
            to={`/auth?role=${roleLink.role}`}
            className="block transition-transform hover:scale-105"
          >
            <Card className="h-full border-2 hover:border-slate-300 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${roleLink.bgGradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <roleLink.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className={`${roleLink.color} text-lg`}>
                  {roleLink.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {roleLink.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-slate-50 transition-colors"
                >
                  Se connecter comme {roleLink.title}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link 
          to="/auth?general=true"
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Connexion générale (tous rôles)
        </Link>
      </div>
    </div>
  );
};
