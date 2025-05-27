
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface NationalityChartProps {
  data: {
    nationalityData: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
}

export const NationalityChart = ({ data }: NationalityChartProps) => {
  const { nationalityData } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Répartition par nationalité
        </CardTitle>
        <CardDescription>
          Distribution des clients par pays d'origine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {nationalityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nationalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {nationalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Aucune donnée disponible pour ce point d'opération
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

