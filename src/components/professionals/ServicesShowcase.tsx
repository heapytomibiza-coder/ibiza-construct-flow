import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Wrench, 
  Hammer, 
  Paintbrush, 
  Droplets, 
  Wind, 
  Lightbulb, 
  Settings, 
  Home,
  LucideIcon,
  Euro,
  Clock
} from 'lucide-react';

interface Service {
  id: string;
  micro_service_id: string;
  service_name?: string;
  description?: string;
  pricing_structure?: {
    base_price?: number;
    price_range?: { min: number; max: number };
  };
  estimated_duration?: string;
  is_active: boolean;
}

interface ServicesShowcaseProps {
  services: Service[];
  onRequestQuote?: (serviceId: string) => void;
}

// Icon mapping for different service types
const getServiceIcon = (serviceName: string): LucideIcon => {
  const name = serviceName.toLowerCase();
  
  if (name.includes('electric') || name.includes('electrical')) return Zap;
  if (name.includes('plumb') || name.includes('water')) return Droplets;
  if (name.includes('carpenter') || name.includes('wood')) return Hammer;
  if (name.includes('paint')) return Paintbrush;
  if (name.includes('hvac') || name.includes('air') || name.includes('heating')) return Wind;
  if (name.includes('light')) return Lightbulb;
  if (name.includes('repair') || name.includes('fix')) return Wrench;
  if (name.includes('maintenance')) return Settings;
  
  return Home; // Default icon
};

export const ServicesShowcase = ({ services, onRequestQuote }: ServicesShowcaseProps) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">No Services Listed Yet</h3>
        <p className="text-muted-foreground">This professional hasn't added their services yet.</p>
      </div>
    );
  }

  const activeServices = services.filter(s => s.is_active);

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">No Active Services</h3>
        <p className="text-muted-foreground">This professional has no active services at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Services Offered</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional services tailored to your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeServices.map((service) => {
          const Icon = getServiceIcon(service.service_name || service.micro_service_id);
          
          return (
            <Card 
              key={service.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50"
            >
              <CardContent className="p-6 space-y-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {service.service_name || service.micro_service_id}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Pricing & Duration */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  {service.pricing_structure?.base_price && (
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">
                        From €{service.pricing_structure.base_price}
                      </span>
                    </div>
                  )}
                  {service.pricing_structure?.price_range && (
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">
                        €{service.pricing_structure.price_range.min} - €{service.pricing_structure.price_range.max}
                      </span>
                    </div>
                  )}
                  {service.estimated_duration && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.estimated_duration}
                    </Badge>
                  )}
                </div>

                {/* CTA Button */}
                {onRequestQuote && (
                  <Button
                    onClick={() => onRequestQuote(service.id)}
                    className="w-full group-hover:shadow-md transition-shadow"
                    size="sm"
                  >
                    Request Quote
                  </Button>
                )}
              </CardContent>

              {/* Decorative gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
