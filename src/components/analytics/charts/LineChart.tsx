import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface LineChartProps {
  data: any[];
  xKey: string;
  lines: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  title?: string;
  height?: number;
}

export function LineChart({ data, xKey, lines, title, height = 300 }: LineChartProps) {
  const chartConfig = lines.reduce((acc, line) => ({
    ...acc,
    [line.key]: {
      label: line.name,
      color: line.color,
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
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xKey}
              tickFormatter={formatXAxis}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, r: 4 }}
                activeDot={{ r: 6 }}
                name={line.name}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
