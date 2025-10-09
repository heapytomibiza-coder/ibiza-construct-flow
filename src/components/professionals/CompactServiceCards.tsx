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
      <div className="space-y-3 text-center mb-8">
        <h2 className="text-4xl font-bold tracking-tight">Services & Pricing</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional services with transparent pricing and quick turnaround
        </p>
      </div>

      {/* Compact Service List */}
      <div className="space-y-4">
        {activeServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative bg-card border-2 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-6">
              {/* Service Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl group-hover:text-primary transition-colors mb-2">
                      {service.service_name || service.micro_service_id}
                    </h3>
                    {service.description && (
                      <p className="text-base text-muted-foreground leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing & Duration Tags */}
                <div className="flex flex-wrap items-center gap-3 ml-10">
                  {service.pricing_structure?.base_price && (
                    <Badge variant="secondary" className="font-bold text-base px-4 py-1.5">
                      <Euro className="w-4 h-4 mr-1.5" />
                      From €{service.pricing_structure.base_price}
                    </Badge>
                  )}
                  {service.pricing_structure?.price_range && (
                    <Badge variant="secondary" className="font-bold text-base px-4 py-1.5">
                      <Euro className="w-4 h-4 mr-1.5" />
                      €{service.pricing_structure.price_range.min} - €{service.pricing_structure.price_range.max}
                    </Badge>
                  )}
                  {service.estimated_duration && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {service.estimated_duration}
                    </Badge>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              {onRequestQuote && (
                <Button
                  onClick={() => onRequestQuote(service.id)}
                  size="lg"
                  className="flex-shrink-0 font-semibold"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* View All Services CTA - if more than 5 services */}
      {activeServices.length > 5 && (
        <div className="text-center pt-4">
          <Button variant="ghost" size="lg" className="group font-semibold">
            View All {activeServices.length} Services
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
    </section>
  );
};
