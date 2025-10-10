import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { PricingBreakdown } from '../hooks/useCalculatorPricing';

interface PriceBreakdownChartProps {
  breakdown: PricingBreakdown;
}

const COLORS = {
  labour: 'hsl(var(--primary))',
  materials: 'hsl(var(--secondary))',
  permits: 'hsl(var(--accent))',
  contingency: 'hsl(var(--muted))',
  disposal: 'hsl(var(--destructive))'
};

const LABELS = {
  labour: 'Labour',
  materials: 'Materials',
  permits: 'Permits & Admin',
  contingency: 'Contingency',
  disposal: 'Waste Disposal'
};

export function PriceBreakdownChart({ breakdown }: PriceBreakdownChartProps) {
  const data = Object.entries(breakdown).map(([key, value]) => ({
    name: LABELS[key as keyof typeof LABELS],
    value: value,
    color: COLORS[key as keyof typeof COLORS]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `€${value.toLocaleString()}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
