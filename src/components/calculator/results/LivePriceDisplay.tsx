import { Clock } from 'lucide-react';
import type { PricingResultProps } from '@/lib/calculator/results/types';

export function LivePriceDisplay({ pricing }: PricingResultProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold mb-2">Estimated Cost</h3>
        <p className="text-4xl font-bold text-primary mb-2">
          €{pricing.lowEstimate.toLocaleString()} - €{pricing.highEstimate.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Base estimate: €{pricing.total.toLocaleString()} ±5%
        </p>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Timeline</p>
          <p className="text-lg font-semibold">
            {pricing.timeline.minDays} - {pricing.timeline.maxDays} days
          </p>
        </div>
      </div>
    </div>
  );
}
