export function PopularSelections() {
  const selections = [
    { name: 'Standard Quality', count: 1242, percentage: 43.6 },
    { name: 'Premium Quality', count: 987, percentage: 34.7 },
    { name: 'Essential Scope', count: 856, percentage: 30.1 },
    { name: 'Extended Scope', count: 723, percentage: 25.4 },
    { name: 'Structural Assessment', count: 412, percentage: 14.5 },
  ];

  return (
    <div className="space-y-4">
      {selections.map((item) => (
        <div key={item.name} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span className="text-muted-foreground">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
