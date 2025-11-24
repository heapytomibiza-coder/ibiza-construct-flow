import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  Ruler, 
  Wrench,
  Shield,
  Sparkles
} from 'lucide-react';
import type { ServiceMenuItem, PricingType } from '@/types/services';

interface Props {
  item: ServiceMenuItem;
  onAddToBasket: (quantity: number) => void;
}

export const EnhancedServiceMenuItemCard: React.FC<Props> = ({ item, onAddToBasket }) => {
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPriceLabel = (pricingType: PricingType) => {
    switch (pricingType) {
      case 'fixed':
      case 'flat_rate':
        return `€${item.price.toFixed(2)}`;
      case 'per_hour':
        return `€${item.price.toFixed(2)}/hr`;
      case 'per_unit':
        return `€${item.price.toFixed(2)}/${item.unit_label || 'unit'}`;
      case 'per_square_meter':
        return `€${item.price.toFixed(2)}/m²`;
      case 'per_project':
        return `€${item.price.toFixed(2)}/project`;
      case 'range':
        return `From €${item.price.toFixed(2)}`;
      case 'quote_required':
        return 'Custom Quote';
      default:
        return `€${item.price.toFixed(2)}`;
    }
  };

  const getPricingTypeBadge = (pricingType: PricingType) => {
    switch (pricingType) {
      case 'range':
        return { label: 'Price Range', variant: 'secondary' as const };
      case 'quote_required':
        return { label: 'Custom Quote', variant: 'default' as const };
      case 'per_hour':
        return { label: 'Hourly', variant: 'outline' as const };
      case 'fixed':
      case 'flat_rate':
        return { label: 'Fixed Price', variant: 'outline' as const };
      default:
        return null;
    }
  };

  const priceLabel = formatPriceLabel(item.pricing_type);
  const pricingBadge = getPricingTypeBadge(item.pricing_type);

  const description = item.long_description || item.description || 'Description available on request.';
  const specs = Object.entries(item.specifications || {}).filter(([, value]) => Boolean(value));
  const hasDetails = (item.whats_included && item.whats_included.length > 0) || specs.length > 0;

  const handleAdd = () => {
    if (item.pricing_type === 'quote_required' || item.pricing_type === 'range') {
      onAddToBasket(1);
      return;
    }
    const safeQuantity = quantity > 0 ? quantity : 1;
    onAddToBasket(safeQuantity);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/30 overflow-hidden">
      {/* Premium Header Gradient */}
      <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      
      <CardContent className="p-5 space-y-4">
        {/* Title & Pricing Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                {pricingBadge && (
                  <Badge variant={pricingBadge.variant} className="text-xs">
                    {pricingBadge.label}
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="min-w-[140px] flex flex-col items-end">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg px-4 py-3 text-right border border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">Starting at</div>
              <div className="text-2xl font-bold text-foreground">{priceLabel}</div>
              {item.pricing_type === 'range' && (
                <div className="text-xs text-muted-foreground mt-1">Varies by project</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        {item.whats_included && item.whats_included.length > 0 && !isExpanded && (
          <div className="flex flex-wrap gap-2">
            {item.whats_included.slice(0, 3).map((point, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-1.5 text-xs bg-muted/50 rounded-full px-3 py-1.5"
              >
                <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{point}</span>
              </div>
            ))}
            {item.whats_included.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.whats_included.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && hasDetails && (
          <Tabs defaultValue="included" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="included" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                What's Included
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                Specifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="included" className="space-y-2 mt-4">
              {item.whats_included && item.whats_included.length > 0 ? (
                <div className="grid gap-2">
                  {item.whats_included.map((point, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground flex-1">{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No inclusions listed</p>
              )}
            </TabsContent>
            
            <TabsContent value="specs" className="mt-4">
              {specs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specs.map(([label, value]) => (
                    <div 
                      key={label} 
                      className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {label.toLowerCase().includes('time') || label.toLowerCase().includes('duration') ? (
                          <Clock className="h-3.5 w-3.5 text-primary" />
                        ) : label.toLowerCase().includes('size') || label.toLowerCase().includes('dimension') ? (
                          <Ruler className="h-3.5 w-3.5 text-primary" />
                        ) : label.toLowerCase().includes('warranty') || label.toLowerCase().includes('guarantee') ? (
                          <Shield className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {label.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specifications listed</p>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          {/* Quantity Selector */}
          {item.pricing_type !== 'quote_required' && item.pricing_type !== 'range' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Quantity:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </Button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {hasDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    Details
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={handleAdd}
              className="shadow-md hover:shadow-lg transition-all"
            >
              Add to Quote
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
