import { useState, useEffect } from 'react';
import { ServiceItemCard } from './ServiceItemCard';
import { ServiceAddons } from './ServiceAddons';
import { BookingRequestSummary } from './BookingRequestSummary';
import { ServiceBenefits } from './ServiceBenefits';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiceOptions } from '@/hooks/useServiceOptions';

interface ServiceConfiguratorProps {
  service: any;
  professionalId?: string;
}

export interface ServiceItemSelection {
  itemId: string;
  quantity: number;
  price: number;
  pricingType: string;
  unitType: string;
}

export interface AddonSelection {
  addonId: string;
  selected: boolean;
  price: number;
}

export const ServiceConfigurator = ({ service, professionalId }: ServiceConfiguratorProps) => {
  const { serviceItems, addons, loading } = useServiceOptions(service.id, professionalId);
  const [selections, setSelections] = useState<ServiceItemSelection[]>([]);
  const [addonSelections, setAddonSelections] = useState<AddonSelection[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price whenever selections change
  useEffect(() => {
    const itemsTotal = selections.reduce((sum, selection) => {
      const item = serviceItems.find(item => item.id === selection.itemId);
      if (!item) return sum;

      let itemPrice = selection.price;
      
      // Apply bulk discount if applicable
      if (item.bulk_discount_threshold && item.bulk_discount_price && selection.quantity >= item.bulk_discount_threshold) {
        itemPrice = item.bulk_discount_price;
      }
      
      return sum + (itemPrice * selection.quantity);
    }, 0);
    
    const addonsTotal = addonSelections
      .filter(addon => addon.selected)
      .reduce((sum, addon) => sum + addon.price, 0);
    
    setTotalPrice(itemsTotal + addonsTotal);
  }, [selections, addonSelections, serviceItems]);

  const handleItemChange = (itemId: string, quantity: number, price: number, pricingType: string, unitType: string) => {
    setSelections(prev => {
      const existing = prev.find(s => s.itemId === itemId);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(s => s.itemId !== itemId);
        }
        return prev.map(s => 
          s.itemId === itemId ? { ...s, quantity, price } : s
        );
      }
      if (quantity > 0) {
        return [...prev, { itemId, quantity, price, pricingType, unitType }];
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
    return <div>Loading professional services...</div>;
  }

  // Group service items by category
  const groupedItems = serviceItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, typeof serviceItems>);

  const categoryLabels = {
    labor: 'Labor & Services',
    materials: 'Materials & Parts',
    additional_services: 'Additional Services'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Professional Service Catalog */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Card key={category} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </h3>
              <Badge variant="outline" className="text-xs">
                {categoryItems.length} services
              </Badge>
            </div>
            <div className="space-y-4">
              {categoryItems.map(item => (
                <ServiceItemCard
                  key={item.id}
                  item={item}
                  onSelectionChange={handleItemChange}
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

      {/* Booking Request Summary Sidebar */}
      <div className="space-y-4">
        <BookingRequestSummary
          service={service}
          selections={selections}
          addonSelections={addonSelections}
          totalPrice={totalPrice}
          serviceItems={serviceItems}
          addons={addons}
        />
      </div>
    </div>
  );
};