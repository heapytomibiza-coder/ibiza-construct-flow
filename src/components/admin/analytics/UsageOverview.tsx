import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { date: 'Jan 1', kitchen: 45, bathroom: 32, extension: 18 },
  { date: 'Jan 8', kitchen: 52, bathroom: 38, extension: 24 },
  { date: 'Jan 15', kitchen: 48, bathroom: 42, extension: 21 },
  { date: 'Jan 22', kitchen: 61, bathroom: 45, extension: 28 },
  { date: 'Jan 29', kitchen: 58, bathroom: 51, extension: 32 },
  { date: 'Feb 5', kitchen: 65, bathroom: 48, extension: 35 },
  { date: 'Feb 12', kitchen: 70, bathroom: 52, extension: 38 },
];

export function UsageOverview() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="kitchen"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
            name="Kitchen"
          />
          <Line
            type="monotone"
            dataKey="bathroom"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--secondary))' }}
            name="Bathroom"
          />
          <Line
            type="monotone"
            dataKey="extension"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--accent))' }}
            name="Extension"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
