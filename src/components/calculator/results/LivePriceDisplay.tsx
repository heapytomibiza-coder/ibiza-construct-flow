import { useCalculatorPricing } from '../hooks/useCalculatorPricing';
import type { CalculatorSelections } from '../hooks/useCalculatorState';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock } from 'lucide-react';

interface LivePriceDisplayProps {
  selections: CalculatorSelections;
}

export function LivePriceDisplay({ selections }: LivePriceDisplayProps) {
  const { pricing, loading } = useCalculatorPricing(selections);

  if (loading || !pricing) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg">
        <div className="container max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg z-10">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold">
                €{pricing.min.toLocaleString()} - €{pricing.max.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="font-semibold">{pricing.timeline} days</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-primary">
            <TrendingUp className="h-4 w-4" />
            <span>Planning estimate ±10%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
