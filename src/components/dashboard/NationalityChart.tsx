
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "France", value: 85, color: "#3B82F6" },
  { name: "Algérie", value: 45, color: "#10B981" },
  { name: "Maroc", value: 38, color: "#F59E0B" },
  { name: "Tunisie", value: 25, color: "#EF4444" },
  { name: "Sénégal", value: 20, color: "#8B5CF6" },
  { name: "Autres", value: 34, color: "#6B7280" },
];

export const NationalityChart = () => {
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
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
