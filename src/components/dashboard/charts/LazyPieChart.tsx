import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface LazyPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const LazyPieChart = ({ data }: LazyPieChartProps) => {
  // Palette de couleurs modernes et attractives
  const modernColors = [
    "#3B82F6", // Bleu moderne
    "#EF4444", // Rouge vibrant
    "#10B981", // Vert émeraude
    "#F59E0B", // Orange doré
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#EC4899", // Rose
    "#6366F1"  // Indigo
  ];

  // Fonction pour traiter les données et regrouper les nationalités moins représentées
  const processDataForDisplay = (rawData: Array<{ name: string; value: number; color: string }>) => {
    // Trier par valeur décroissante
    const sortedData = [...rawData].sort((a, b) => b.value - a.value);
    
    // Prendre les 8 premières nationalités avec des couleurs modernes
    const topNationalities = sortedData.slice(0, 8).map((item, index) => ({
      ...item,
      color: modernColors[index] || item.color
    }));
    const otherNationalities = sortedData.slice(8);
    
    // Si il y a des nationalités "autres", les regrouper
    if (otherNationalities.length > 0) {
      const otherTotal = otherNationalities.reduce((sum, item) => sum + item.value, 0);
      const processedData = [
        ...topNationalities,
        {
          name: `Autres (${otherNationalities.length} pays)`,
          value: otherTotal,
          color: "#94A3B8" // Couleur grise moderne pour "Autres"
        }
      ];
      return processedData;
    }
    
    return topNationalities;
  };

  const processedData = processDataForDisplay(data);

  // Fonction personnalisée pour les labels avec design moderne
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    // Ne pas afficher les labels pour les segments trop petits (moins de 4%)
    if (percent < 0.04) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="700"
        style={{
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))'
        }}
      >
        {value}
      </text>
    );
  };

  // ✅ Hook pour détecter la taille d'écran
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // ✅ Injecter CSS pour supprimer outlines sur mobile
    const style = document.createElement('style');
    style.textContent = `
      .recharts-wrapper svg,
      .recharts-wrapper svg *,
      .recharts-sector,
      .recharts-legend-item {
        outline: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      .recharts-sector:focus,
      .recharts-sector:active,
      .recharts-legend-item:focus,
      .recharts-legend-item:active {
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart 
          key={JSON.stringify(processedData)}
          style={{ outline: 'none' }}
        >
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
            </filter>
          </defs>
          <Pie
            data={processedData}
            cx="50%"
            cy={isMobile ? "40%" : "50%"}  // ✅ CORRECTION MOBILE : Remonter centre sur mobile
            labelLine={false}
            label={renderCustomLabel}
            innerRadius={isMobile ? 45 : 65}  // ✅ Plus petit sur mobile
            outerRadius={isMobile ? 95 : 130}  // ✅ Plus petit sur mobile
            dataKey="value"
            paddingAngle={2}
            style={{ 
              filter: 'url(#shadow)',
              outline: 'none'
            }}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}-${entry.name}`} 
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
                style={{ 
                  outline: 'none',
                  cursor: 'default'
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value} client${value > 1 ? 's' : ''}`, 
              name
            ]}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              outline: 'none'
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: isMobile ? '8px' : '20px',  // ✅ Moins d'espace sur mobile
              fontSize: isMobile ? '11px' : '14px',   // ✅ Plus petit sur mobile
              outline: 'none'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LazyPieChart; 