import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
  { type: 'Kitchen', standard: 18500, premium: 32000, luxury: 48000 },
  { type: 'Bathroom', standard: 12000, premium: 21000, luxury: 35000 },
  { type: 'Extension', standard: 28000, premium: 45000, luxury: 68000 },
];

export function RevenueProjections() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="type" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value: number) => `€${value.toLocaleString()}`}
          />
          <Legend />
          <Bar dataKey="standard" fill="hsl(var(--primary))" name="Standard" radius={[4, 4, 0, 0]} />
          <Bar dataKey="premium" fill="hsl(var(--secondary))" name="Premium" radius={[4, 4, 0, 0]} />
          <Bar dataKey="luxury" fill="hsl(var(--accent))" name="Luxury" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
