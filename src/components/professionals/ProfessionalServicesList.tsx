import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Euro, Clock, CheckCircle } from 'lucide-react';

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

interface ProfessionalServicesListProps {
  services: Service[];
  onRequestQuote?: (serviceId: string) => void;
}

export const ProfessionalServicesList = ({ 
  services, 
  onRequestQuote 
}: ProfessionalServicesListProps) => {
  if (!services || services.length === 0) return null;

  const activeServices = services.filter(s => s.is_active);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Offered</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">
                    {service.service_name || service.micro_service_id}
                  </h4>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-3">
                {service.pricing_structure?.base_price && (
                  <div className="flex items-center gap-1 text-sm">
                    <Euro className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                      From €{service.pricing_structure.base_price}
                    </span>
                  </div>
                )}
                {service.pricing_structure?.price_range && (
                  <div className="flex items-center gap-1 text-sm">
                    <Euro className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                      €{service.pricing_structure.price_range.min} - €{service.pricing_structure.price_range.max}
                    </span>
                  </div>
                )}
                {service.estimated_duration && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.estimated_duration}</span>
                  </div>
                )}
              </div>

              {onRequestQuote && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestQuote(service.id)}
                  className="w-full"
                >
                  Request Quote
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
