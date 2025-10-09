import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Euro, 
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

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

interface CompactServiceCardsProps {
  services: Service[];
  onRequestQuote?: (serviceId: string) => void;
}

export const CompactServiceCards = ({ services, onRequestQuote }: CompactServiceCardsProps) => {
  const activeServices = services.filter(s => s.is_active);

  if (activeServices.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Services & Pricing</h2>
        <p className="text-muted-foreground">
          Professional services with transparent pricing
        </p>
      </div>

      {/* Compact Service List */}
      <div className="space-y-3">
        {activeServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative bg-card border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Service Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {service.service_name || service.micro_service_id}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing & Duration Tags */}
                <div className="flex flex-wrap items-center gap-3 ml-8">
                  {service.pricing_structure?.base_price && (
                    <Badge variant="secondary" className="font-semibold">
                      <Euro className="w-3 h-3 mr-1" />
                      From €{service.pricing_structure.base_price}
                    </Badge>
                  )}
                  {service.pricing_structure?.price_range && (
                    <Badge variant="secondary" className="font-semibold">
                      <Euro className="w-3 h-3 mr-1" />
                      €{service.pricing_structure.price_range.min} - €{service.pricing_structure.price_range.max}
                    </Badge>
                  )}
                  {service.estimated_duration && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.estimated_duration}
                    </Badge>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              {onRequestQuote && (
                <Button
                  onClick={() => onRequestQuote(service.id)}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* View All Services CTA - if more than 5 services */}
      {activeServices.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="ghost" className="group">
            View All {activeServices.length} Services
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
    </section>
  );
};
