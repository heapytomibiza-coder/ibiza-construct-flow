import type { PricingResultProps } from '@/lib/calculator/results/types';

export function PriceBreakdownChart({ pricing }: PricingResultProps) {
  const { breakdown, total } = pricing;

  const items = [
    { label: 'Labour', value: breakdown.labour, color: 'bg-blue-500' },
    { label: 'Materials', value: breakdown.materials, color: 'bg-green-500' },
    { label: 'Permits', value: breakdown.permits, color: 'bg-yellow-500' },
    { label: 'Contingency', value: breakdown.contingency, color: 'bg-orange-500' },
    { label: 'Disposal', value: breakdown.disposal, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4 pt-4 border-t">
      <h4 className="font-semibold">Cost Breakdown</h4>
      
      {/* Visual bar */}
      <div className="flex h-8 rounded-lg overflow-hidden">
        {items.map((item) => (
          <div
            key={item.label}
            className={item.color}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: €${item.value.toLocaleString()}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-medium">€{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-semibold pt-2 border-t">
        <span>Total</span>
        <span>€{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
