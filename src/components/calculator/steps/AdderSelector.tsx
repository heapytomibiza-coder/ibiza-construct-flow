import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculatorCard } from '../ui/CalculatorCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Adder } from '../hooks/useCalculatorState';
import { Checkbox } from '@/components/ui/checkbox';
import { EducationTooltip } from '../ui/EducationTooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface AdderSelectorProps {
  projectType: string;
  selected: Adder[];
  onSelect: (adders: Adder[]) => void;
}

export function AdderSelector({ projectType, selected, onSelect }: AdderSelectorProps) {
  const [adders, setAdders] = useState<Adder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchAdders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('calculator_adders' as any)
        .select('*')
        .eq('project_type', projectType)
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        setAdders(data as any);
      }
      setLoading(false);
    };

    fetchAdders();
  }, [projectType]);

  const toggleAdder = (adder: Adder) => {
    const isSelected = selected.some(a => a.id === adder.id);
    if (isSelected) {
      onSelect(selected.filter(a => a.id !== adder.id));
    } else {
      onSelect([...selected, adder]);
    }
  };

  const formatPrice = (adder: Adder) => {
    if (adder.price_type === 'fixed') {
      return `€${adder.price_value.toLocaleString()}`;
    } else if (adder.price_type === 'percentage') {
      return `+${adder.price_value}%`;
    } else {
      return `€${adder.price_value}/m²`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const commonAdders = adders.filter((a: any) => a.is_common);
  const advancedAdders = adders.filter((a: any) => !a.is_common);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Any extras?</h2>
        <p className="text-muted-foreground">Add optional upgrades and special requirements</p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          {commonAdders.map(adder => {
            const isSelected = selected.some(a => a.id === adder.id);
            return (
              <CalculatorCard key={adder.id} selected={isSelected}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{adder.display_name}</h4>
                      {adder.tooltip && <EducationTooltip content={adder.tooltip} />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{adder.description}</p>
                    <p className="text-sm font-semibold text-primary">{formatPrice(adder)}</p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleAdder(adder)}
                  />
                </div>
              </CalculatorCard>
            );
          })}
        </div>

        {advancedAdders.length > 0 && (
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <span>Advanced Options</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid md:grid-cols-2 gap-3">
                {advancedAdders.map(adder => {
                  const isSelected = selected.some(a => a.id === adder.id);
                  return (
                    <CalculatorCard key={adder.id} selected={isSelected}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{adder.display_name}</h4>
                            {adder.tooltip && <EducationTooltip content={adder.tooltip} />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{adder.description}</p>
                          <p className="text-sm font-semibold text-primary">{formatPrice(adder)}</p>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleAdder(adder)}
                        />
                      </div>
                    </CalculatorCard>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
