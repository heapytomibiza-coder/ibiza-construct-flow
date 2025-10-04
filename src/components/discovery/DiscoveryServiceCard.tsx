import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBookingCart } from '@/contexts/BookingCartContext';
import { Star, Clock, MapPin, ShoppingCart, MessageSquare, Plus, Minus } from 'lucide-react';
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
  const { addItem } = useBookingCart();
  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = () => {
    if (item.pricing_type === 'quote_required') {
      navigate(`/professional/${item.professional_id}?service=${item.id}&action=quote`);
      return;
    }

    addItem({
      id: item.id,
      professionalId: item.professional_id,
      professionalName: item.professional?.full_name || 'Professional',
      serviceName: item.name,
      quantity,
      pricePerUnit: item.base_price,
      pricingType: item.pricing_type,
      unitType: item.unit_type,
      imageUrl: item.images?.[0],
    });

    toast.success(`Added ${item.name} to cart`);
    setQuantity(1);
  };

  const handleRequestQuote = () => {
    navigate(`/professional/${item.professional_id}?service=${item.id}&action=quote`);
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
          {item.pricing_type === 'quote_required' ? (
            <Button
              onClick={handleRequestQuote}
              className="flex-1"
              variant="default"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Quote
            </Button>
          ) : (
            <>
              {item.pricing_type !== 'flat_rate' && (
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                variant="default"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
