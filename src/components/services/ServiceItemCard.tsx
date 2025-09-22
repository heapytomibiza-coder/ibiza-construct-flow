import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfessionalServiceItem {
  id: string;
  professional_id: string;
  service_id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: string;
  unit_type: string;
  min_quantity: number;
  max_quantity: number | null;
  bulk_discount_threshold: number | null;
  bulk_discount_price: number | null;
  category: string;
  estimated_duration_minutes: number | null;
  difficulty_level: string;
  is_active: boolean;
  display_order: number;
}

interface ServiceItemCardProps {
  item: ProfessionalServiceItem;
  onSelectionChange: (itemId: string, quantity: number, price: number, pricingType: string, unitType: string) => void;
}

export const ServiceItemCard = ({ item, onSelectionChange }: ServiceItemCardProps) => {
  const [quantity, setQuantity] = useState(0);

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getUnitLabel = () => {
    switch (item.unit_type) {
      case 'hours': return 'hour(s)';
      case 'items': return 'item(s)';
      case 'rooms': return 'room(s)';
      case 'sqm': return 'm²';
      case 'linear_meter': return 'linear meter(s)';
      default: return item.unit_type;
    }
  };

  const getPricingTypeLabel = () => {
    switch (item.pricing_type) {
      case 'hourly': return 'per hour';
      case 'per_item': return 'per item';
      case 'per_unit': return `per ${item.unit_type}`;
      case 'flat_rate': return 'flat rate';
      case 'quote_required': return 'quote required';
      default: return item.pricing_type;
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(0, Math.min(newQuantity, item.max_quantity || 999));
    if (clampedQuantity < item.min_quantity && clampedQuantity > 0) {
      return; // Don't allow quantities below minimum
    }
    
    setQuantity(clampedQuantity);
    
    const effectivePrice = item.bulk_discount_threshold && item.bulk_discount_price && clampedQuantity >= item.bulk_discount_threshold
      ? item.bulk_discount_price
      : item.base_price;
    
    onSelectionChange(item.id, clampedQuantity, effectivePrice, item.pricing_type, item.unit_type);
  };

  const getDifficultyColor = () => {
    switch (item.difficulty_level) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const totalPrice = () => {
    const effectivePrice = item.bulk_discount_threshold && item.bulk_discount_price && quantity >= item.bulk_discount_threshold
      ? item.bulk_discount_price
      : item.base_price;
    return effectivePrice * quantity;
  };

  if (item.pricing_type === 'quote_required') {
    return (
      <Card className="p-4 border-l-4 border-l-orange-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-foreground">{item.name}</h4>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                Quote Required
              </Badge>
              <Badge className={`text-xs ${getDifficultyColor()}`}>
                {item.difficulty_level}
              </Badge>
            </div>
            
            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            )}
            
            {item.estimated_duration_minutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Est. {formatDuration(item.estimated_duration_minutes)}</span>
              </div>
            )}
          </div>
          
          <Button variant="outline" size="sm" className="ml-4">
            Request Quote
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground">{item.name}</h4>
            <Badge className={`text-xs ${getDifficultyColor()}`}>
              {item.difficulty_level}
            </Badge>
            {item.bulk_discount_threshold && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Bulk Discount
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatPrice(item.bulk_discount_price!)} each when ordering {item.bulk_discount_threshold}+ {getUnitLabel()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {item.description && (
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="font-medium text-foreground">
              {formatPrice(item.base_price)} {getPricingTypeLabel()}
            </span>
            {item.estimated_duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Est. {formatDuration(item.estimated_duration_minutes)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 0}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            
            <div className="text-center min-w-[60px]">
              <div className="text-sm font-medium">{quantity}</div>
              <div className="text-xs text-muted-foreground">{getUnitLabel()}</div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={item.max_quantity ? quantity >= item.max_quantity : false}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {quantity > 0 && (
            <div className="text-right">
              <div className="text-lg font-semibold text-foreground">
                {formatPrice(totalPrice())}
              </div>
              {item.bulk_discount_threshold && quantity >= item.bulk_discount_threshold && (
                <div className="text-xs text-green-600">Bulk discount applied!</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {item.min_quantity > 1 && quantity > 0 && quantity < item.min_quantity && (
        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
          Minimum quantity: {item.min_quantity} {getUnitLabel()}
        </div>
      )}
    </Card>
  );
};