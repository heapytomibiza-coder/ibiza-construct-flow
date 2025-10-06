import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BarChartProps {
  data: any[];
  xKey: string;
  bars: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  title?: string;
  height?: number;
  stacked?: boolean;
}

export function BarChart({ data, xKey, bars, title, height = 300, stacked = false }: BarChartProps) {
  const chartConfig = bars.reduce((acc, bar) => ({
    ...acc,
    [bar.key]: {
      label: bar.name,
      color: bar.color,
    }
  }), {});

  return (
    <div className="w-full" style={{ height }}>
      {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xKey} className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color}
                name={bar.name}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
