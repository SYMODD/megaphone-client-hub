import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface LazyBarChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const LazyBarChart = ({ data }: LazyBarChartProps) => {
  console.log("📊 LazyBarChart - Données reçues:", data);
  
  // Fonction pour traiter les données - prendre les top 12 nationalités
  const processDataForDisplay = (rawData: Array<{ name: string; value: number; color: string }>) => {
    // Trier par valeur décroissante
    const sortedData = [...rawData].sort((a, b) => b.value - a.value);
    
    // Prendre les 12 premières nationalités
    const topNationalities = sortedData.slice(0, 12);
    const otherNationalities = sortedData.slice(12);
    
    // Si il y a des nationalités "autres", les regrouper
    if (otherNationalities.length > 0) {
      const otherTotal = otherNationalities.reduce((sum, item) => sum + item.value, 0);
      const processedData = [
        ...topNationalities,
        {
          name: `Autres (${otherNationalities.length} pays)`,
          value: otherTotal,
          color: "#94a3b8" // Couleur grise pour "Autres"
        }
      ];
      return processedData;
    }
    
    return topNationalities;
  };

  const processedData = processDataForDisplay(data);
  console.log("📊 LazyBarChart - Données traitées:", processedData);

  // Calculer la valeur maximale pour configurer l'axe X
  const maxValue = Math.max(...processedData.map(item => item.value));
  console.log("📊 LazyBarChart - Valeur max:", maxValue);

  // Fonction personnalisée pour formater les labels de l'axe Y
  const formatYAxisLabel = (value: string) => {
    // Limiter la longueur des noms de pays
    if (value.length > 15) {
      return value.substring(0, 12) + '...';
    }
    return value;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processedData}
        layout="horizontal"
        margin={{ top: 20, right: 30, left: 110, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          type="number" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${Math.round(value)}`}
          domain={[0, maxValue + 1]}
          allowDecimals={false}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 11 }}
          tickFormatter={formatYAxisLabel}
          width={100}
        />
        <Tooltip 
          formatter={(value: number, name: string, props: any) => [
            `${value} client${value > 1 ? 's' : ''}`, 
            props.payload.name
          ]}
          labelFormatter={(name) => name}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '14px'
          }}
        />
        <Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LazyBarChart; 