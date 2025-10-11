import { CalculatorCard } from '../ui/CalculatorCard';
import type { CalculatorAdder } from '@/lib/calculator/data-model';
import { Checkbox } from '@/components/ui/checkbox';
import { EducationTooltip } from '../ui/EducationTooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface AdderSelectorProps {
  adders: CalculatorAdder[];
  selected: string[];
  onToggle: (adderId: string) => void;
}

export function AdderSelector({ adders, selected, onToggle }: AdderSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatPrice = (adder: CalculatorAdder) => {
    if (adder.priceType === 'fixed') {
      return `€${adder.priceValue.toLocaleString()}`;
    } else if (adder.priceType === 'percentage') {
      return `+${(adder.priceValue * 100).toFixed(0)}%`;
    } else {
      return `€${adder.priceValue}/m²`;
    }
  };

  // For now, treat all adders as common (no advanced filtering)
  const commonAdders = adders;
  const advancedAdders: CalculatorAdder[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Any extras?</h2>
        <p className="text-muted-foreground">Add optional upgrades and special requirements</p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          {commonAdders.map(adder => {
            const isSelected = selected.includes(adder.id);
            return (
              <CalculatorCard key={adder.id} selected={isSelected}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{adder.name}</h4>
                      {adder.tooltip && <EducationTooltip content={adder.tooltip} />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{adder.description}</p>
                    <p className="text-sm font-semibold text-primary">{formatPrice(adder)}</p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(adder.id)}
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
                  const isSelected = selected.includes(adder.id);
                  return (
                    <CalculatorCard key={adder.id} selected={isSelected}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{adder.name}</h4>
                            {adder.tooltip && <EducationTooltip content={adder.tooltip} />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{adder.description}</p>
                          <p className="text-sm font-semibold text-primary">{formatPrice(adder)}</p>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggle(adder.id)}
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
