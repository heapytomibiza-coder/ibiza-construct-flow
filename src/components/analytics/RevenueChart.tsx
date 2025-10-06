import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface RevenueTrend {
  date: string;
  revenue: number;
  payment_count: number;
}

interface RevenueChartProps {
  data: RevenueTrend[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  const chartData = data
    .map((item) => ({
      date: format(parseISO(item.date), 'MMM dd'),
      revenue: Number(item.revenue),
      payments: Number(item.payment_count),
    }))
    .reverse();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Revenue ($)"
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="payments"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          name="Payments"
          dot={{ fill: 'hsl(var(--accent))', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
