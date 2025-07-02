
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, Globe } from "lucide-react";
import { useEffect } from "react";

interface ClientStatsProps {
  data: {
    totalClients: number;
    newThisMonth: number;
    contractsGenerated: number;
    nationalities: number;
  };
}

export const ClientStats = ({ data }: ClientStatsProps) => {
  const { totalClients, newThisMonth, contractsGenerated, nationalities } = data;

  useEffect(() => {
    console.log("🔄 ClientStats RE-RENDER avec nouvelles données:", data);
  }, [data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{totalClients}</div>
          <p className="text-xs opacity-80">+12% ce mois</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nouveaux (30 jours)</CardTitle>
          <TrendingUp className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{newThisMonth}</div>
          <p className="text-xs opacity-80">Sur les 30 derniers jours</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contrats générés</CardTitle>
          <Calendar className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{contractsGenerated}</div>
          <p className="text-xs opacity-80">76% du total</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nationalités</CardTitle>
          <Globe className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{nationalities}</div>
          <p className="text-xs opacity-80">Pays représentés</p>
        </CardContent>
      </Card>
    </div>
  );
};
