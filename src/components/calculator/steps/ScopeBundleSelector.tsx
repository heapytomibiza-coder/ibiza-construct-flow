import { CalculatorCard } from '../ui/CalculatorCard';
import type { ScopeBundle } from '@/lib/calculator/data-model';
import { Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ScopeBundleSelectorProps {
  bundles: ScopeBundle[];
  selected: string[];
  onToggle: (bundleId: string) => void;
}

export function ScopeBundleSelector({ bundles, selected, onToggle }: ScopeBundleSelectorProps) {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">What's included?</h2>
        <p className="text-muted-foreground">Select the scope of work for your project</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {bundles.map(bundle => {
          const isSelected = selected.includes(bundle.id);
          return (
            <CalculatorCard key={bundle.id} selected={isSelected}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{bundle.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{bundle.description}</p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(bundle.id)}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <Check className="h-4 w-4" /> Included
                    </p>
                    <ul className="space-y-1">
                      {bundle.included.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                      <X className="h-4 w-4" /> Not Included
                    </p>
                    <ul className="space-y-1">
                      {bundle.excluded.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CalculatorCard>
          );
        })}
      </div>
    </div>
  );
}
