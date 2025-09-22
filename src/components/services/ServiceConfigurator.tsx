import { useState, useEffect } from 'react';
import { ServiceOptionCard } from './ServiceOptionCard';
import { ServiceAddons } from './ServiceAddons';
import { BookingSummary } from './BookingSummary';
import { ServiceBenefits } from './ServiceBenefits';
import { Card } from '@/components/ui/card';
import { useServiceOptions } from '@/hooks/useServiceOptions';

interface ServiceConfiguratorProps {
  service: any;
}

export interface ServiceSelection {
  optionId: string;
  quantity: number;
  price: number;
}

export interface AddonSelection {
  addonId: string;
  selected: boolean;
  price: number;
}

export const ServiceConfigurator = ({ service }: ServiceConfiguratorProps) => {
  const { options, addons, loading } = useServiceOptions(service.id);
  const [selections, setSelections] = useState<ServiceSelection[]>([]);
  const [addonSelections, setAddonSelections] = useState<AddonSelection[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price whenever selections change
  useEffect(() => {
    const optionsTotal = selections.reduce((sum, selection) => 
      sum + (selection.price * selection.quantity), 0
    );
    
    const addonsTotal = addonSelections
      .filter(addon => addon.selected)
      .reduce((sum, addon) => sum + addon.price, 0);
    
    setTotalPrice(optionsTotal + addonsTotal);
  }, [selections, addonSelections]);

  const handleOptionChange = (optionId: string, quantity: number, price: number) => {
    setSelections(prev => {
      const existing = prev.find(s => s.optionId === optionId);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(s => s.optionId !== optionId);
        }
        return prev.map(s => 
          s.optionId === optionId ? { ...s, quantity, price } : s
        );
      }
      if (quantity > 0) {
        return [...prev, { optionId, quantity, price }];
      }
      return prev;
    });
  };

  const handleAddonChange = (addonId: string, selected: boolean, price: number) => {
    setAddonSelections(prev => {
      const existing = prev.find(a => a.addonId === addonId);
      if (existing) {
        return prev.map(a => 
          a.addonId === addonId ? { ...a, selected } : a
        );
      }
      return [...prev, { addonId, selected, price }];
    });
  };

  if (loading) {
    return <div>Loading service options...</div>;
  }

  // Group options by category
  const groupedOptions = options.reduce((groups, option) => {
    if (!groups[option.category]) {
      groups[option.category] = [];
    }
    groups[option.category].push(option);
    return groups;
  }, {} as Record<string, typeof options>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Service Options */}
        {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
          <Card key={category} className="p-6">
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {category.replace('_', ' ')}
            </h3>
            <div className="space-y-4">
              {categoryOptions.map(option => (
                <ServiceOptionCard
                  key={option.id}
                  option={option}
                  onSelectionChange={handleOptionChange}
                />
              ))}
            </div>
          </Card>
        ))}

        {/* Service Add-ons */}
        {addons.length > 0 && (
          <ServiceAddons 
            addons={addons}
            onAddonChange={handleAddonChange}
          />
        )}

        {/* Service Benefits */}
        <ServiceBenefits service={service} />
      </div>

      {/* Booking Summary Sidebar */}
      <div className="space-y-4">
        <BookingSummary
          service={service}
          selections={selections}
          addonSelections={addonSelections}
          totalPrice={totalPrice}
          options={options}
          addons={addons}
        />
      </div>
    </div>
  );
};