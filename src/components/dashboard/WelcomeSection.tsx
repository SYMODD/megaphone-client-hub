
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, User, MapPin } from "lucide-react";
import { RoleIndicator } from "./RoleIndicator";

interface WelcomeSectionProps {
  profile: {
    prenom: string;
    nom: string;
    role: string;
    point_operation?: string;
  };
  userEmail: string;
}

export const WelcomeSection = ({ profile, userEmail }: WelcomeSectionProps) => {
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
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center mb-3">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
          <User className="w-7 h-7 text-white" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Sud Megaphone
        </h1>
        <p className="text-base text-slate-600">
          Client Manager Dashboard
        </p>
      </div>
      
      {/* Enhanced User Profile Card - Mobile Optimized */}
      <Card className="max-w-md mx-auto bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-800">
                {profile.prenom} {profile.nom}
              </h2>
              <RoleIndicator role={profile.role} size="lg" />
            </div>
            
            {profile.point_operation && (
              <div className="flex items-center space-x-2 text-slate-600 bg-slate-100 rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{getPointLabel(profile.point_operation)}</span>
              </div>
            )}
            
            <div className="text-xs text-slate-400 font-mono bg-slate-100 rounded px-2 py-1 break-all">
              {userEmail}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          <Users className="w-4 h-4 mr-1" />
          Gestion des clients
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          <TrendingUp className="w-4 h-4 mr-1" />
          Suivi en temps réel
        </Badge>
      </div>
    </div>
  );
};
