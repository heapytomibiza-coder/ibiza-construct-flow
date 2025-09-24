import React from 'react';
import { Star, Clock, Award, ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileServiceCardProps {
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
    location?: string;
    micro?: string;
    slug?: string;
  };
  onViewService: () => void;
  onBookNow: () => void;
}

export const MobileServiceCard = ({ service, onViewService, onBookNow }: MobileServiceCardProps) => {
  const IconComponent = service.icon;

  return (
    <Card className="w-full border-0 shadow-sm hover:shadow-md transition-shadow bg-card">
      {service.popular && (
        <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-3 py-1 text-xs font-semibold rounded-t-lg">
          ⭐ Popular Choice
        </div>
      )}
      
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          {/* Title and Category */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1 text-foreground">
              {service.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {service.category}
            </Badge>
          </div>
          
          {/* Rating */}
          {service.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{service.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Meta Info Row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          {service.completedJobs && (
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3 text-primary" />
              <span>{service.completedJobs}+ jobs</span>
            </div>
          )}
          {service.responseTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-600" />
              <span>{service.responseTime}</span>
            </div>
          )}
          {service.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span>{service.location}</span>
            </div>
          )}
        </div>

        {/* Price and Actions Row */}
        <div className="flex items-center justify-between">
          <div className="text-primary font-semibold text-base">
            {service.priceRange}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewService}
              className="min-h-[44px] px-4"
            >
              Details
            </Button>
            <Button 
              size="sm"
              onClick={onBookNow}
              className="min-h-[44px] px-4 bg-gradient-to-r from-primary to-primary-glow border-0"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};