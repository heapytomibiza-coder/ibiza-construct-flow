import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculatorCard } from '../ui/CalculatorCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScopeBundle } from '../hooks/useCalculatorState';
import { Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ScopeBundleSelectorProps {
  projectType: string;
  selected: ScopeBundle[];
  onSelect: (bundles: ScopeBundle[]) => void;
}

export function ScopeBundleSelector({ projectType, selected, onSelect }: ScopeBundleSelectorProps) {
  const [bundles, setBundles] = useState<ScopeBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('calculator_scope_bundles' as any)
        .select('*')
        .eq('project_type', projectType)
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        setBundles(data);
        // Auto-select default bundle
        const defaultBundle = data.find(b => b.is_default);
        if (defaultBundle && selected.length === 0) {
          onSelect([defaultBundle]);
        }
      }
      setLoading(false);
    };

    fetchBundles();
  }, [projectType]);

  const toggleBundle = (bundle: ScopeBundle) => {
    const isSelected = selected.some(b => b.id === bundle.id);
    if (isSelected) {
      onSelect(selected.filter(b => b.id !== bundle.id));
    } else {
      onSelect([...selected, bundle]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">What's included?</h2>
        <p className="text-muted-foreground">Select the scope of work for your project</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {bundles.map(bundle => {
          const isSelected = selected.some(b => b.id === bundle.id);
          return (
            <CalculatorCard key={bundle.id} selected={isSelected}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{bundle.display_name}</h3>
                    {bundle.base_uplift_percentage > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{bundle.base_uplift_percentage}% uplift
                      </p>
                    )}
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleBundle(bundle)}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <Check className="h-4 w-4" /> Included
                    </p>
                    <ul className="space-y-1">
                      {bundle.included_items.map((item, idx) => (
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
                      {bundle.excluded_items.slice(0, 3).map((item, idx) => (
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
