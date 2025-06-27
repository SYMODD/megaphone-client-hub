import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface LazyPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const LazyPieChart = ({ data }: LazyPieChartProps) => {
  return (
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
        <Tooltip 
          formatter={(value: number, name: string) => [
            `${value} client${value > 1 ? 's' : ''}`, 
            name
          ]}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '14px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LazyPieChart; 