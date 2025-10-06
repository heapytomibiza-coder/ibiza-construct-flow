import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors: string[];
  title?: string;
  height?: number;
}

export function PieChart({ data, colors, title, height = 300 }: PieChartProps) {
  const chartConfig = data.reduce((acc, item, index) => ({
    ...acc,
    [item.name]: {
      label: item.name,
      color: colors[index % colors.length],
    }
  }), {});

  return (
    <div className="w-full" style={{ height }}>
      {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
