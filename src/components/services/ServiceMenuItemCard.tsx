import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ServiceMenuItem, PricingType } from '@/types/services';

interface Props {
  item: ServiceMenuItem;
  onAddToBasket: (quantity: number) => void;
}

export const ServiceMenuItemCard: React.FC<Props> = ({ item, onAddToBasket }) => {
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPriceLabel = (pricingType: PricingType) => {
    switch (pricingType) {
      case 'fixed':
      case 'flat_rate':
        return `€${item.price.toFixed(2)} (fixed price)`;
      case 'per_hour':
        return `€${item.price.toFixed(2)} / hour`;
      case 'per_unit':
        return `€${item.price.toFixed(2)} / ${item.unit_label || 'unit'}`;
      case 'per_square_meter':
        return `€${item.price.toFixed(2)} / m²`;
      case 'per_project':
        return `€${item.price.toFixed(2)} / project`;
      case 'range':
        return `From €${item.price.toFixed(2)}`;
      case 'quote_required':
        return 'Price on quote';
      default:
        return `€${item.price.toFixed(2)}`;
    }
  };

  const getPricingTypeBadge = (pricingType: PricingType) => {
    switch (pricingType) {
      case 'range':
        return 'Price Range';
      case 'quote_required':
        return 'Custom Quote';
      case 'per_hour':
        return 'Hourly Rate';
      case 'per_unit':
        return 'Per Unit';
      case 'per_square_meter':
        return 'Per m²';
      default:
        return null;
    }
  };

  const priceLabel = formatPriceLabel(item.pricing_type);
  const pricingBadge = getPricingTypeBadge(item.pricing_type);

  const description =
    item.long_description || item.description || 'Description available on request.';

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
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <h4 className="font-semibold leading-tight flex-1">{item.name}</h4>
              {pricingBadge && (
                <Badge variant="secondary" className="text-xs">
                  {pricingBadge}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>

            {item.whats_included && item.whats_included.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-2">What's Included:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {item.whats_included.slice(0, isExpanded ? undefined : 3).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {item.whats_included.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 mt-2 text-xs"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show {item.whats_included.length - 3} More
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {specs.length > 0 && isExpanded && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-foreground mb-2">Specifications:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {specs.map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <span className="font-medium text-foreground capitalize">
                        {label.replace(/_/g, ' ')}
                      </span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-right min-w-[160px] flex flex-col items-end">
            <div className="text-lg font-bold text-foreground mb-1">{priceLabel}</div>
            
            {item.pricing_type === 'range' && (
              <p className="text-xs text-muted-foreground mb-3">Final price varies by project</p>
            )}

            {item.pricing_type !== 'quote_required' && item.pricing_type !== 'range' && (
              <div className="flex items-center justify-end gap-2 mt-2 mb-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </Button>
              </div>
            )}

            <Button 
              className="w-full shadow-sm hover:shadow-md transition-shadow" 
              size="sm" 
              onClick={handleAdd}
            >
              Add to Quote
            </Button>
            
            {specs.length > 0 && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 mt-2 text-xs text-muted-foreground"
                onClick={() => setIsExpanded(true)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
