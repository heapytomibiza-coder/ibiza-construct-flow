import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  is_popular: boolean;
}

interface ServiceAddonsProps {
  addons: ServiceAddon[];
  onAddonChange: (addonId: string, selected: boolean, price: number) => void;
}

export const ServiceAddons = ({ addons, onAddonChange }: ServiceAddonsProps) => {
  const formatPrice = (price: number) => `€${price.toFixed(0)}`;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Optional Add-ons</h3>
      
      <div className="space-y-4">
        {addons.map(addon => (
          <div 
            key={addon.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
          >
            <Checkbox
              id={addon.id}
              onCheckedChange={(checked) => 
                onAddonChange(addon.id, !!checked, addon.price)
              }
              className="mt-1"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <label 
                  htmlFor={addon.id}
                  className="font-medium text-foreground cursor-pointer"
                >
                  {addon.name}
                </label>
                {addon.is_popular && (
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {addon.description}
              </p>
            </div>
            
            <div className="text-right">
              <span className="font-semibold text-foreground">
                +{formatPrice(addon.price)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};