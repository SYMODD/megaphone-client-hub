import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LazyLineChartProps {
  data: any[];
}

const LazyLineChart = ({ data }: LazyLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} key={JSON.stringify(data)}>
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
  );
};

export default LazyLineChart; 