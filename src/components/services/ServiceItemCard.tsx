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
  viewMode?: 'visual' | 'detailed';
}

export const ServiceItemCard = ({ item, onSelectionChange, viewMode = 'detailed' }: ServiceItemCardProps) => {
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
      <Card className={`p-4 bg-gradient-card border-2 border-dashed border-copper/30 hover:border-copper/50 transition-colors ${
        viewMode === 'visual' ? 'text-center' : ''
      }`}>
        <div className={`flex items-center ${viewMode === 'visual' ? 'flex-col gap-3' : 'justify-between'}`}>
          {viewMode === 'visual' && (
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">💬</span>
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-charcoal">{item.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            {item.estimated_duration_minutes && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground justify-center">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(item.estimated_duration_minutes)}</span>
              </div>
            )}
          </div>
          <div className={viewMode === 'visual' ? 'w-full' : 'text-right'}>
            <Badge variant="outline" className="bg-copper/10 text-copper border-copper/30">
              Quote Required
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  if (viewMode === 'visual') {
    return (
      <Card className="card-luxury hover:scale-105 transition-all duration-300 cursor-pointer group">
        <div className="p-4">
          {/* Visual Header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-hero rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-white text-2xl">
                {item.category === 'labor' ? '⚒️' : item.category === 'materials' ? '🔧' : '✨'}
              </span>
            </div>
            <h4 className="font-semibold text-charcoal">{item.name}</h4>
            {item.difficulty_level && (
              <Badge className={`text-xs mt-1 ${getDifficultyColor()}`}>
                {item.difficulty_level}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Duration and Unit */}
          <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-4">
            {item.estimated_duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(item.estimated_duration_minutes)}</span>
              </div>
            )}
            <span>Per {getUnitLabel()}</span>
          </div>

          {/* Price Display */}
          <div className="text-center mb-4">
            <div className="text-copper font-bold text-lg">
              {formatPrice(item.base_price)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getPricingTypeLabel()}
            </div>
            {item.bulk_discount_threshold && item.bulk_discount_price && (
              <div className="text-xs text-green-600 mt-1">
                Bulk: {formatPrice(item.bulk_discount_price!)} after {item.bulk_discount_threshold}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity <= 0}
              className="w-8 h-8 p-0 hover:bg-copper/10"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <div className="w-16 h-8 bg-sand/50 rounded-md flex items-center justify-center font-medium">
              {quantity}
            </div>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={item.max_quantity && quantity >= item.max_quantity}
              className="w-8 h-8 p-0 hover:bg-copper/10"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Total Price */}
          {quantity > 0 && (
            <div className="text-center p-2 bg-gradient-card rounded-lg">
              <div className="text-sm font-semibold text-charcoal">
                Total: {formatPrice(totalPrice())}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Detailed view (original layout)
  return (
    <Card className="card-luxury hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="font-semibold text-charcoal text-lg">{item.name}</h4>
            {item.difficulty_level && (
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getDifficultyColor()}`}
              >
                {item.difficulty_level}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {item.estimated_duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(item.estimated_duration_minutes)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Per {getUnitLabel()}</span>
            </div>
          </div>
        </div>

        <div className="text-right min-w-[140px]">
          <div className="mb-4">
            <div className="text-right">
              <span className="text-copper font-bold text-xl">
                {formatPrice(item.base_price)}
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                {getPricingTypeLabel()}
              </div>
            </div>
            
            {item.bulk_discount_threshold && item.bulk_discount_price && (
              <div className="text-xs text-green-600 mt-1">
                {formatPrice(item.bulk_discount_price!)} each after {item.bulk_discount_threshold}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
                disabled={quantity <= 0}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={item.max_quantity && quantity >= item.max_quantity}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            {quantity > 0 && (
              <div className="text-center">
                <div className="text-sm font-semibold text-charcoal">
                  Total: {formatPrice(totalPrice())}
                </div>
              </div>
            )}
          </div>
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