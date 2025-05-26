
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Database } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Link to="/nouveau-client">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Nouveau Client</h3>
            <p className="text-sm text-slate-500">Ajouter un client</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/base-clients">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Base Clients</h3>
            <p className="text-sm text-slate-500">Consulter la liste</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/contrats">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Contrats</h3>
            <p className="text-sm text-slate-500">Générer PDF</p>
          </CardContent>
        </Card>
      </Link>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">Statistiques</h3>
          <p className="text-sm text-slate-500">Voir les rapports</p>
        </CardContent>
      </Card>
    </div>
  );
};
