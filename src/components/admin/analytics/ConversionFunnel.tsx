import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const funnelData = [
  { step: 'Started', count: 2847, color: 'hsl(var(--primary))' },
  { step: 'Step 3', count: 2421, color: 'hsl(var(--primary))' },
  { step: 'Step 5', count: 2103, color: 'hsl(var(--primary))' },
  { step: 'Completed', count: 1945, color: 'hsl(var(--primary))' },
  { step: 'Converted', count: 342, color: 'hsl(var(--secondary))' },
];

export function ConversionFunnel() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={funnelData} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="step" type="category" className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
