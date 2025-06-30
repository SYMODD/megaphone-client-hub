import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useEffect, useState, Suspense, lazy } from "react";

// ✅ LAZY LOADING SIMPLIFIÉ - Chargement dynamique du graphique
const LazyPieChart = lazy(() => import("./charts/LazyPieChart"));

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