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
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LazyPieChart; 