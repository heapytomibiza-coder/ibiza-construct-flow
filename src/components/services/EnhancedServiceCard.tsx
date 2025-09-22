import { Star, Clock, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: {
    title: string;
    description: string;
    priceRange: string;
    category: string;
    popular: boolean;
    icon: React.ComponentType<any>;
    rating?: number;
    completedJobs?: number;
    responseTime?: string;
  };
  onViewService: () => void;
  onBookNow: () => void;
}

export const EnhancedServiceCard = ({ service, onViewService, onBookNow }: ServiceCardProps) => {
  const IconComponent = service.icon;

  return (
    <Card className="card-luxury hover:scale-105 group cursor-pointer relative transition-all duration-300">
      {service.popular && (
        <div className="absolute -top-3 -right-3 bg-gradient-hero text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          Popular
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          {/* Icon and Category */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <Badge variant="secondary" className="bg-sand text-charcoal">
              {service.category}
            </Badge>
          </div>

          {/* Service Details */}
          <div className="flex-1">
            <h3 className="text-display font-semibold text-charcoal mb-2 text-lg">
              {service.title}
            </h3>
            
            <p className="text-body text-muted-foreground text-sm mb-4 leading-relaxed">
              {service.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
              {service.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{service.rating}</span>
                </div>
              )}
              {service.completedJobs && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-copper" />
                  <span>{service.completedJobs}+ jobs</span>
                </div>
              )}
              {service.responseTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>{service.responseTime}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <span className="text-copper font-semibold text-lg">
                {service.priceRange}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button 
              variant="outline" 
              className="flex-1 group/btn"
              onClick={onViewService}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            <Button 
              className="flex-1 btn-hero border-0"
              onClick={onBookNow}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};