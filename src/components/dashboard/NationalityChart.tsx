import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// ❌ SUPPRIMÉ: import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState, Suspense, lazy } from "react";

// ✅ LAZY LOADING - Chargement dynamique du PieChart
const LazyPieChart = lazy(async () => {
  const { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } = await import("recharts");
  
  return {
    default: ({ data }: { data: Array<{ name: string; value: number; color: string }> }) => (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart key={JSON.stringify(data)}>
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
              <Cell key={`cell-${index}-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  };
});

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
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    console.log("🔄 NationalityChart RE-RENDER avec nouvelles données:", nationalityData);
  }, [nationalityData]);

  // ✅ Chargement différé pour optimiser le bundle initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartVisible(true);
    }, 150); // Petit délai pour étaler le chargement
    
    return () => clearTimeout(timer);
  }, []);

  console.log("NationalityChart rendering with data:", nationalityData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Répartition par nationalité
        </CardTitle>
        <CardDescription>
          Distribution des clients par pays d'origine ({nationalityData.reduce((sum, item) => sum + item.value, 0)} clients)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {nationalityData.length > 0 ? (
            chartVisible ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-gray-500">Chargement du graphique...</div>
                </div>
              }>
                <LazyPieChart data={nationalityData} />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-gray-500">Préparation du graphique...</div>
              </div>
            )
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