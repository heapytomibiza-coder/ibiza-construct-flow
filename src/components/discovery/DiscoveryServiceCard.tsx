import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBookingCart } from '@/contexts/BookingCartContext';
import { Star, Clock, MapPin, MessageSquare, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DiscoveryServiceCardProps {
  item: {
    id: string;
    professional_id: string;
    service_id: string;
    name: string;
    description: string | null;
    base_price: number;
    pricing_type: 'flat_rate' | 'per_hour' | 'per_unit' | 'quote_required';
    unit_type: string;
    category: string;
    estimated_duration_minutes: number | null;
    difficulty_level: string;
    images?: string[];
    professional?: {
      full_name: string;
      avatar_url?: string;
      rating?: number;
      distance?: number;
    };
  };
  onViewDetails?: () => void;
}

export const DiscoveryServiceCard = ({ item, onViewDetails }: DiscoveryServiceCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = () => {
    if (item.pricing_type === 'quote_required') {
      return 'Quote Required';
    }
    if (item.pricing_type === 'flat_rate') {
      return `€${item.base_price}`;
    }
    if (item.pricing_type === 'per_hour') {
      return `From €${item.base_price}/hr`;
    }
    if (item.pricing_type === 'per_unit') {
      return `€${item.base_price}/${item.unit_type}`;
    }
    return 'Price on request';
  };

  const getPriceBadgeVariant = () => {
    if (item.pricing_type === 'quote_required') return 'secondary';
    if (item.pricing_type === 'flat_rate') return 'default';
    return 'outline';
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      // Navigate to dedicated service detail page
      navigate(`/service/${item.id}`);
    }
  };

  const handleContactNow = () => {
    // Navigate to professional's profile with contact/quote action auto-open
    navigate(`/professionals/${item.professional_id}?service=${item.id}&action=contact`);
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.()}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl">{item.category === 'Electrical' ? '⚡' : '🔧'}</span>
          </div>
        )}

        {/* Price Badge Overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant={getPriceBadgeVariant()} className="shadow-lg font-semibold">
            {formatPrice()}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
            {item.category}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Service Name */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {item.name}
        </h3>

        {/* Professional Info */}
        {item.professional && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.professional.avatar_url} />
              <AvatarFallback>
                {item.professional.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium truncate">{item.professional.full_name}</span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {item.professional?.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{item.professional.rating}</span>
            </div>
          )}
          {item.estimated_duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(item.estimated_duration_minutes / 60)}h</span>
            </div>
          )}
          {item.professional?.distance && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{item.professional.distance.toFixed(1)}km</span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={handleViewDetails}
            className="flex-1"
            variant="outline"
          >
            <Info className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            onClick={handleContactNow}
            className="flex-1"
            variant="default"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Now
          </Button>
        </div>
      </div>
    </Card>
  );
};
