import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Euro, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  image_url?: string;
}

interface CompactServiceCardsProps {
  services: Service[];
  professionalId?: string;
  onRequestQuote?: (serviceId: string) => void;
}

export const CompactServiceCards = ({ services, professionalId, onRequestQuote }: CompactServiceCardsProps) => {
  const navigate = useNavigate();
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

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden bg-muted">
                <img 
                  src={service.image_url || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop`}
                  alt={service.service_name || service.micro_service_id}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Pricing Badge on Image */}
                <div className="absolute top-4 right-4">
                  {service.pricing_structure?.base_price && (
                    <Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1.5 shadow-lg">
                      <Euro className="w-4 h-4 mr-1" />
                      From €{service.pricing_structure.base_price}
                    </Badge>
                  )}
                  {service.pricing_structure?.price_range && (
                    <Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1.5 shadow-lg">
                      <Euro className="w-4 h-4 mr-1" />
                      €{service.pricing_structure.price_range.min} - €{service.pricing_structure.price_range.max}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {service.service_name || service.micro_service_id}
                </h3>
                
                {service.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
                    {service.description}
                  </p>
                )}

                {/* Duration Badge */}
                {service.estimated_duration && (
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1.5" />
                      {service.estimated_duration}
                    </Badge>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  {onRequestQuote && (
                    <Button
                      variant="outline"
                      onClick={() => onRequestQuote(service.id)}
                      className="flex-1 font-semibold"
                      size="lg"
                    >
                      Quick Quote
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate(`/service/${service.micro_service_id}${professionalId ? `?professional=${professionalId}` : ''}`)}
                    className="flex-1 font-semibold group-hover:shadow-md"
                    size="lg"
                  >
                    View Menu
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
