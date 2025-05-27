
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link to="/nouveau-client">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Nouveau Client</h3>
              <p className="text-xs sm:text-sm text-slate-600">Ajouter un nouveau client</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/contrats">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-purple-50 to-purple-50 hover:from-purple-100 hover:to-purple-100">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Contrats</h3>
              <p className="text-xs sm:text-sm text-slate-600">Générer et gérer</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }

  // Actions complètes pour admin et superviseur
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Link to="/nouveau-client">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Nouveau Client</h3>
            <p className="text-xs sm:text-sm text-slate-600">Ajouter un client</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/base-clients">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Database className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Base Clients</h3>
            <p className="text-xs sm:text-sm text-slate-600">Consulter la liste</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/contrats">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-purple-50 to-purple-50 hover:from-purple-100 hover:to-purple-100">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Contrats</h3>
            <p className="text-xs sm:text-sm text-slate-600">Générer PDF</p>
          </CardContent>
        </Card>
      </Link>

      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Statistiques</h3>
          <p className="text-xs sm:text-sm text-slate-600">Voir les rapports</p>
        </CardContent>
      </Card>
    </div>
  );
};
