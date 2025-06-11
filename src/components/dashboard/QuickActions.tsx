
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Database, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const QuickActions = () => {
  const { profile, user } = useAuth();
  const isAgent = profile?.role === "agent";
  const isAdmin = profile?.role === "admin" || user?.email?.toLowerCase() === "essbane.salim@gmail.com";

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
  const actionItems = [
    {
      to: "/nouveau-client",
      title: "Nouveau Client",
      description: "Ajouter un client",
      icon: Plus,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      hoverBgGradient: "from-green-100 to-emerald-100"
    },
    {
      to: "/base-clients",
      title: "Base Clients",
      description: "Consulter la liste",
      icon: Database,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-50",
      hoverBgGradient: "from-blue-100 to-blue-100"
    },
    {
      to: "/contrats",
      title: "Contrats",
      description: "Générer PDF",
      icon: FileText,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-50",
      hoverBgGradient: "from-purple-100 to-purple-100"
    },
    {
      to: null, // Utiliser null au lieu de "#" pour les actions non-cliquables
      title: "Statistiques",
      description: "Voir les rapports",
      icon: Users,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      hoverBgGradient: "from-orange-100 to-red-100"
    }
  ];

  // Ajouter la configuration reCAPTCHA pour les admins
  if (isAdmin) {
    actionItems.splice(3, 0, {
      to: "/admin/recaptcha",
      title: "Configuration reCAPTCHA",
      description: "Sécurité",
      icon: Settings,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-50",
      hoverBgGradient: "from-orange-100 to-orange-100"
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {actionItems.map((action, index) => {
        const cardContent = (
          <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br ${action.bgGradient} hover:${action.hoverBgGradient}`}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">{action.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600">{action.description}</p>
            </CardContent>
          </Card>
        );

        // Si action.to existe, envelopper avec Link, sinon retourner directement le contenu
        if (action.to) {
          return (
            <Link key={action.title} to={action.to}>
              {cardContent}
            </Link>
          );
        } else {
          return (
            <div key={action.title}>
              {cardContent}
            </div>
          );
        }
      })}
    </div>
  );
};
