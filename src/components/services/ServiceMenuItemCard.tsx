import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ServiceMenuItem, PricingType } from '@/types/services';

interface Props {
  item: ServiceMenuItem;
  onAddToBasket: (quantity: number) => void;
}

export const ServiceMenuItemCard: React.FC<Props> = ({ item, onAddToBasket }) => {
  const [quantity, setQuantity] = useState(1);

  const formatPriceLabel = (pricingType: PricingType) => {
    switch (pricingType) {
      case 'fixed':
      case 'flat_rate':
        return `${item.price.toFixed(2)} € (precio fijo)`;
      case 'per_hour':
        return `${item.price.toFixed(2)} € / hora`;
      case 'per_unit':
        return `${item.price.toFixed(2)} € / ${item.unit_label || 'unidad'}`;
      case 'per_square_meter':
        return `${item.price.toFixed(2)} € / m²`;
      case 'per_project':
        return `${item.price.toFixed(2)} € / proyecto`;
      case 'range':
        return `Desde ${item.price.toFixed(2)} €`;
      case 'quote_required':
        return 'Precio bajo presupuesto';
      default:
        return `${item.price.toFixed(2)} €`;
    }
  };

  const priceLabel = formatPriceLabel(item.pricing_type);

  const description =
    item.long_description || item.description || 'Descripción disponible bajo solicitud.';

  const specs = Object.entries(item.specifications || {}).filter(
    ([, value]) => Boolean(value)
  );

  const handleAdd = () => {
    if (item.pricing_type === 'quote_required' || item.pricing_type === 'range') {
      onAddToBasket(1);
      return;
    }

    const safeQuantity = quantity > 0 ? quantity : 1;
    onAddToBasket(safeQuantity);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold leading-tight">{item.name}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{description}</p>

            {item.whats_included && item.whats_included.length > 0 && (
              <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-1">
                {item.whats_included.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}

            {specs.length > 0 && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{label}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-right min-w-[140px]">
            <div className="text-sm font-semibold text-foreground">{priceLabel}</div>

            {item.pricing_type !== 'quote_required' && (
              <div className="flex items-center justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Disminuir cantidad"
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </Button>
              </div>
            )}

            <Button className="mt-3 w-full" size="sm" onClick={handleAdd}>
              Añadir al presupuesto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
