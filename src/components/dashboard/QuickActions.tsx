
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const QuickActions = () => {
  const { profile } = useAuth();
  const isAgent = profile?.role === "agent";

  if (isAgent) {
    // Actions limitées pour les agents
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Link to="/nouveau-client">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Nouveau Client</h3>
              <p className="text-xs sm:text-sm text-slate-500">Ajouter un client</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/contrats">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Contrats</h3>
              <p className="text-xs sm:text-sm text-slate-500">Générer PDF</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }

  // Actions complètes pour admin et superviseur
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Link to="/nouveau-client">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Nouveau Client</h3>
            <p className="text-xs sm:text-sm text-slate-500">Ajouter un client</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/base-clients">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Base Clients</h3>
            <p className="text-xs sm:text-sm text-slate-500">Consulter la liste</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/contrats">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Contrats</h3>
            <p className="text-xs sm:text-sm text-slate-500">Générer PDF</p>
          </CardContent>
        </Card>
      </Link>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Statistiques</h3>
          <p className="text-xs sm:text-sm text-slate-500">Voir les rapports</p>
        </CardContent>
      </Card>
    </div>
  );
};
