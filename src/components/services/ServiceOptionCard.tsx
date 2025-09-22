import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  base_price: number;
  price_per_unit: number;
  min_quantity: number;
  max_quantity: number | null;
  is_required: boolean;
}

interface ServiceOptionCardProps {
  option: ServiceOption;
  onSelectionChange: (optionId: string, quantity: number, price: number) => void;
}

export const ServiceOptionCard = ({ option, onSelectionChange }: ServiceOptionCardProps) => {
  const [quantity, setQuantity] = useState(option.is_required ? option.min_quantity : 0);

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(
      option.is_required ? option.min_quantity : 0,
      Math.min(newQuantity, option.max_quantity || 999)
    );
    
    setQuantity(clampedQuantity);
    onSelectionChange(
      option.id, 
      clampedQuantity, 
      option.price_per_unit || option.base_price
    );
  };

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;
  const currentPrice = option.price_per_unit || option.base_price;

  return (
    <Card className="p-4 border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground">{option.name}</h4>
            {option.is_required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {option.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              {formatPrice(currentPrice)}
              {quantity > 1 && (
                <span className="text-sm text-muted-foreground ml-1">each</span>
              )}
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= (option.is_required ? option.min_quantity : 0)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="min-w-[2rem] text-center font-medium">
                {quantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={option.max_quantity ? quantity >= option.max_quantity : false}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {quantity > 0 && (
            <div className="mt-2 text-right">
              <span className="text-sm font-medium text-foreground">
                Total: {formatPrice(currentPrice * quantity)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};