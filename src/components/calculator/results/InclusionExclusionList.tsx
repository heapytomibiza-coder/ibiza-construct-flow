import { Check, X } from 'lucide-react';
import type { PricingResultProps } from '@/lib/calculator/results/types';

export function InclusionExclusionList({ pricing }: PricingResultProps) {
  const { bundles } = pricing;

  if (bundles.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      <h4 className="font-semibold">What's Included</h4>

      {bundles.map((bundle) => (
        <div key={bundle.id} className="space-y-3">
          <div>
            <h5 className="font-medium text-sm mb-2">{bundle.name}</h5>
            
            {/* Included items */}
            {bundle.included.length > 0 && (
              <div className="space-y-1 mb-3">
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Included
                </p>
                <ul className="space-y-1">
                  {bundle.included.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-5">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Excluded items */}
            {bundle.excluded.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Not Included
                </p>
                <ul className="space-y-1">
                  {bundle.excluded.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-5">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}

      {pricing.adders.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h5 className="font-medium text-sm mb-2">Additional Selections</h5>
          <ul className="space-y-1">
            {pricing.adders.map((adder) => (
              <li key={adder.id} className="text-sm text-muted-foreground flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                {adder.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
