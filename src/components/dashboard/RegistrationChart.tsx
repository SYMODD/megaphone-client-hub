
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ClientData } from "@/types/agentDataTypes";

interface RegistrationChartProps {
  data: {
    clients: ClientData[];
  };
}

export const RegistrationChart = ({ data }: RegistrationChartProps) => {
  const { clients } = data;

  // Générer les données d'enregistrement basées sur les clients filtrés
  const registrationData = useMemo(() => {
    console.log("📊 Génération des données d'enregistrement pour", clients.length, "clients");
    
    // Générer les 12 derniers mois
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      // Compter les clients enregistrés dans ce mois
      const clientsInMonth = clients.filter(client => {
        const registrationDate = new Date(client.dateEnregistrement);
        return registrationDate >= monthStart && registrationDate <= monthEnd;
      }).length;
      
      months.push({
        month: format(date, "MMM", { locale: fr }),
        clients: clientsInMonth
      });
    }
    
    console.log("📈 Données d'enregistrement générées:", months);
    return months;
  }, [clients]);

  useEffect(() => {
    console.log("🔄 RegistrationChart RE-RENDER avec nouvelles données:", registrationData);
  }, [registrationData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Enregistrements par mois
        </CardTitle>
        <CardDescription>
          Évolution des inscriptions sur l'année ({clients.length} clients total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationData} key={JSON.stringify(registrationData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="clients" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
