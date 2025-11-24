import React from 'react';
import { ServiceMenuItem } from '@/types/services';
import { ServiceMenuItemCard } from './ServiceMenuItemCard';

interface Props {
  groupName: string;
  items: ServiceMenuItem[];
  onAddToBasket: (item: ServiceMenuItem, quantity: number) => void;
}

export const ServiceMenuSection: React.FC<Props> = ({
  groupName,
  items,
  onAddToBasket,
}) => {
  if (!items.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{groupName}</h3>
        <span className="text-sm text-muted-foreground">{items.length} options</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <ServiceMenuItemCard
            key={item.id}
            item={item}
            onAddToBasket={(qty) => onAddToBasket(item, qty)}
          />
        ))}
      </div>
    </section>
  );
};
