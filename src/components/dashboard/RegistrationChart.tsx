
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect } from "react";

interface RegistrationChartProps {
  data: {
    registrationData: Array<{
      month: string;
      clients: number;
    }>;
  };
}

export const RegistrationChart = ({ data }: RegistrationChartProps) => {
  const { registrationData } = data;

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
          Évolution des inscriptions sur l'année
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
