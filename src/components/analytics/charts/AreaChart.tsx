import { Area, AreaChart as RechartsAreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AreaChartProps {
  data: any[];
  xKey: string;
  areas: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  title?: string;
  height?: number;
  stacked?: boolean;
}

export function AreaChart({ data, xKey, areas, title, height = 300, stacked = false }: AreaChartProps) {
  const chartConfig = areas.reduce((acc, area) => ({
    ...acc,
    [area.key]: {
      label: area.name,
      color: area.color,
    }
  }), {});

  const formatXAxis = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full" style={{ height }}>
      {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xKey}
              tickFormatter={formatXAxis}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {areas.map((area) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                stroke={area.color}
                fill={area.color}
                fillOpacity={0.6}
                name={area.name}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
