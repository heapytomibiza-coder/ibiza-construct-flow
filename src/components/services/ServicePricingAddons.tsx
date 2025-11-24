import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { ServicePricingAddon } from '@/types/services';

interface ServicePricingAddonsProps {
  addons: ServicePricingAddon[];
  basePrice: number;
  onSelectionChange?: (selectedAddons: string[], totalPrice: number) => void;
}

export const ServicePricingAddons = ({
  addons,
  basePrice,
  onSelectionChange,
}: ServicePricingAddonsProps) => {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const { includedAddons, optionalAddons } = useMemo(() => {
    return {
      includedAddons: addons.filter(addon => addon.is_included_in_base),
      optionalAddons: addons.filter(addon => addon.is_optional && !addon.is_included_in_base),
    };
  }, [addons]);

  const totalPrice = useMemo(() => {
    const addonsTotal = Array.from(selectedAddons).reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.addon_price || 0);
    }, 0);
    return basePrice + addonsTotal;
  }, [selectedAddons, addons, basePrice]);

  const handleToggleAddon = (addonId: string, checked: boolean) => {
    setSelectedAddons(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(addonId);
      } else {
        newSet.delete(addonId);
      }
      
      if (onSelectionChange) {
        const addonsTotal = Array.from(newSet).reduce((sum, id) => {
          const addon = addons.find(a => a.id === id);
          return sum + (addon?.addon_price || 0);
        }, 0);
        onSelectionChange(Array.from(newSet), basePrice + addonsTotal);
      }
      
      return newSet;
    });
  };

  if (!addons || addons.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">What's Included</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">€{totalPrice.toFixed(2)}</span>
          {selectedAddons.size > 0 && (
            <span className="text-sm text-muted-foreground">
              (Base: €{basePrice.toFixed(2)})
            </span>
          )}
        </div>
      </div>

      {/* Base Package Items */}
      {includedAddons.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground uppercase mb-3">
            Base Package
          </h4>
          <div className="space-y-2">
            {includedAddons.map(addon => (
              <div 
                key={addon.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{addon.addon_name}</p>
                  {addon.addon_description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {addon.addon_description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Add-ons */}
      {optionalAddons.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase mb-3">
            Optional Add-ons
          </h4>
          <div className="space-y-3">
            {optionalAddons.map(addon => (
              <div 
                key={addon.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
              >
                <Checkbox
                  id={addon.id}
                  checked={selectedAddons.has(addon.id)}
                  onCheckedChange={(checked) => 
                    handleToggleAddon(addon.id, !!checked)
                  }
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={addon.id}
                    className="font-medium text-sm cursor-pointer"
                  >
                    {addon.addon_name}
                  </label>
                  {addon.addon_description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {addon.addon_description}
                    </p>
                  )}
                </div>
                
                <div className="text-right whitespace-nowrap">
                  <span className="font-semibold text-sm">
                    +€{addon.addon_price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
