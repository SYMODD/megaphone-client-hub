
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", clients: 12 },
  { month: "Fév", clients: 19 },
  { month: "Mar", clients: 15 },
  { month: "Avr", clients: 25 },
  { month: "Mai", clients: 22 },
  { month: "Jun", clients: 30 },
  { month: "Jul", clients: 28 },
  { month: "Aoû", clients: 35 },
  { month: "Sep", clients: 31 },
  { month: "Oct", clients: 40 },
  { month: "Nov", clients: 38 },
  { month: "Déc", clients: 23 },
];

export const RegistrationChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Enregistrements par mois
        </CardTitle>
        <CardDescription>
          Évolution des inscriptions sur l'année
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
