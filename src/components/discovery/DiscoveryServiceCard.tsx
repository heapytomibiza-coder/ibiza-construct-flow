import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBookingCart } from '@/contexts/BookingCartContext';
import { Star, Clock, MapPin, MessageSquare, Info, LucideIcon, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getCategoryIcon } from '@/lib/categoryIcons';

// Import category images
import constructionImg from '@/assets/categories/construction.jpg';
import carpentryImg from '@/assets/categories/carpentry.jpg';
import electricalImg from '@/assets/categories/electrical.jpg';
import plumbingImg from '@/assets/categories/plumbing.jpg';
import hvacImg from '@/assets/categories/hvac.jpg';
import paintingImg from '@/assets/categories/painting.jpg';
import landscapingImg from '@/assets/categories/landscaping.jpg';
import flooringImg from '@/assets/categories/flooring.jpg';
import cleaningImg from '@/assets/categories/cleaning.jpg';
import poolImg from '@/assets/categories/pool.jpg';
import handymanImg from '@/assets/categories/handyman.jpg';
import architectureImg from '@/assets/categories/architecture.jpg';
import propertyImg from '@/assets/categories/property.jpg';
import bathroomImg from '@/assets/categories/bathroom.jpg';

interface DiscoveryServiceCardProps {
  item: {
    id: string;
    professional_id: string;
    service_id: string;
    name: string;
    description: string | null;
    base_price: number;
    pricing_type: 'fixed' | 'per_hour' | 'per_unit' | 'per_square_meter' | 'per_project' | 'range' | 'quote_required';
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
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Map database categories to display-friendly names
  const getCategoryDisplayName = (): string => {
    const categoryLower = item.category?.toLowerCase() || '';
    
    const categoryNameMap: Record<string, string> = {
      'carpentry': 'Carpentry',
      'carpentry-woodwork': 'Carpentry',
      'electricity-lighting': 'Electrical',
      'electrical': 'Electrical',
      'plumbing': 'Plumbing',
      'security-systems': 'Security',
      'domotics-sonorisation': 'Smart Home',
      'metalwork': 'Metalwork',
      'labor': 'General Labor',
      'masonry': 'Masonry',
      'proveedores': 'Suppliers',
      'building': 'Construction',
      'construction': 'Construction',
      'air-conditioning': 'HVAC',
      'hvac': 'HVAC',
      'painting': 'Painting',
      'landscaping': 'Landscaping',
      'flooring': 'Flooring',
      'cleaning': 'Cleaning',
      'pool': 'Pool Services',
      'handyman': 'Handyman',
      'architecture': 'Architecture',
      'property': 'Property',
      'bathroom': 'Bathroom',
    };

    // Try exact match first
    if (categoryNameMap[categoryLower]) {
      return categoryNameMap[categoryLower];
    }

    // Try partial match
    for (const [key, displayName] of Object.entries(categoryNameMap)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return displayName;
      }
    }
    
    // Fallback to original category with capitalization
    return item.category?.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Service';
  };

  const formatPrice = () => {
    // Ensure minimum price for transparency (no €0)
    const price = item.base_price > 0 ? item.base_price : 50;
    return `€${price.toFixed(0)}`;
  };

  const getPriceUnit = () => {
    // Handle actual database values
    if (item.pricing_type === 'per_square_meter') return '/m²';
    if (item.pricing_type === 'per_unit') {
      // Use unit_type for context
      if (item.unit_type === 'sqm') return '/m²';
      if (item.unit_type === 'set') return '/set';
      if (item.unit_type === 'item') return '/unit';
      return '/unit';
    }
    if (item.pricing_type === 'per_project') return '/project';
    if (item.pricing_type === 'fixed') return '';
    if (item.pricing_type === 'per_hour') return '/hour';
    if (item.pricing_type === 'range') return '+';
    if (item.pricing_type === 'quote_required' || item.base_price <= 0) return '+';
    return '';
  };

  const getPricingExplanation = () => {
    if (item.pricing_type === 'per_square_meter') return 'Price per square meter';
    if (item.pricing_type === 'per_unit') {
      if (item.unit_type === 'set') return 'Price per complete set';
      if (item.unit_type === 'sqm') return 'Price per square meter';
      return 'Price per unit';
    }
    if (item.pricing_type === 'per_project') return 'Total project price';
    if (item.pricing_type === 'fixed') return 'Fixed price';
    if (item.pricing_type === 'per_hour') return 'Hourly rate';
    if (item.pricing_type === 'range') return 'Starting from this price';
    if (item.pricing_type === 'quote_required' || item.base_price <= 0) return 'Custom quote required';
    return 'Contact for pricing';
  };

  const getCategoryImage = (): string | null => {
    const categoryLower = item.category?.toLowerCase() || '';
    
    const categoryImageMap: Record<string, string> = {
      'building': constructionImg,
      'construction': constructionImg,
      'carpentry': carpentryImg,
      'carpentry-woodwork': carpentryImg,
      'electrical': electricalImg,
      'electricity-lighting': electricalImg,
      'plumbing': plumbingImg,
      'air-conditioning': hvacImg,
      'hvac': hvacImg,
      'painting': paintingImg,
      'landscaping': landscapingImg,
      'flooring': flooringImg,
      'cleaning': cleaningImg,
      'pool': poolImg,
      'handyman': handymanImg,
      'labor': handymanImg,
      'architecture': architectureImg,
      'property': propertyImg,
      'bathroom': bathroomImg,
      'security-systems': electricalImg,
      'security': electricalImg,
      'domotics-sonorisation': hvacImg,
      'smart': hvacImg,
      'metalwork': constructionImg,
      'masonry': constructionImg,
      'proveedores': propertyImg,
    };

    // Try exact match first
    if (categoryImageMap[categoryLower]) {
      return categoryImageMap[categoryLower];
    }

    // Try partial match
    for (const [key, image] of Object.entries(categoryImageMap)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return image;
      }
    }
    
    return null;
  };

  const getCategoryIconComponent = (): LucideIcon => {
    // Try to get icon from category metadata
    const categoryLower = item.category?.toLowerCase() || '';
    
    if (categoryLower.includes('door') || categoryLower.includes('window')) {
      return getCategoryIcon('DoorOpen');
    }
    if (categoryLower.includes('kitchen')) {
      return getCategoryIcon('Home');
    }
    if (categoryLower.includes('metalwork') || categoryLower.includes('welding')) {
      return getCategoryIcon('Hammer');
    }
    if (categoryLower.includes('machinery') || categoryLower.includes('industrial')) {
      return getCategoryIcon('HardHat');
    }
    if (categoryLower.includes('electrical')) {
      return getCategoryIcon('Zap');
    }
    if (categoryLower.includes('plumbing')) {
      return getCategoryIcon('Droplet');
    }
    if (categoryLower.includes('painting')) {
      return getCategoryIcon('Paintbrush');
    }
    
    return getCategoryIcon('Wrench');
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      // Navigate to dedicated service detail page with correct service_id and professional filter
      navigate(`/service/${item.service_id}?professional=${item.professional_id}`);
    }
  };

  const handleContactNow = () => {
    // Navigate to professional's profile with contact/quote action auto-open
    navigate(`/professionals/${item.professional_id}?service=${item.id}&action=contact`);
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col",
        "hover:shadow-2xl hover:scale-[1.02] hover:border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section - Fixed Height with Hover Overlay */}
      <div className="relative h-40 overflow-hidden bg-muted flex-shrink-0">
        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 flex items-center justify-center">
            <div className="text-white text-center space-y-2 p-4">
              <p className="text-sm font-medium">{t('quickView')}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleViewDetails} className="h-7 text-xs">
                  {t('viewDetails')}
                </Button>
                <Button size="sm" onClick={handleContactNow} className="h-7 text-xs">
                  {t('contact')}
                </Button>
              </div>
            </div>
          </div>
        )}
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : getCategoryImage() ? (
          <img
            src={getCategoryImage()!}
            alt={item.category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            {React.createElement(getCategoryIconComponent(), {
              className: "h-12 w-12 text-primary/60"
            })}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 left-2 z-20">
          <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm text-xs font-medium border border-primary/20">
            {getCategoryDisplayName()}
          </Badge>
        </div>

        {/* Verified Badge */}
        {item.professional && (
          <div className="absolute top-2 right-2 z-20">
            <Badge className="bg-green-600/90 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {t('verified')}
            </Badge>
          </div>
        )}
        
        {/* Starting From Price Badge - Bottom Left */}
        {!isHovered && (
          <div className="absolute bottom-2 left-2 z-20">
            <Badge className="bg-primary/90 backdrop-blur-sm text-white font-bold px-3 py-1">
              {t('from')} {formatPrice()}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section - Flex Grow */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Service Name - Fixed 2 Lines */}
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
          {item.name}
        </h3>

        {/* Professional & Quick Stats - Compact Single Row */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-2 mb-2">
          {item.professional && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={item.professional.avatar_url} />
                <AvatarFallback className="text-[10px]">
                  {item.professional.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate">{item.professional.full_name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.professional?.rating && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{Number(item.professional.rating).toFixed(1)}</span>
              </div>
            )}
            {item.professional?.distance && (
              <div className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                <span>{item.professional.distance.toFixed(1)}km</span>
              </div>
            )}
          </div>
        </div>

        {/* Description - Optional, 2 Lines Max */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Spacer to push pricing and buttons to bottom */}
        <div className="flex-grow" />

        {/* Prominent Pricing Section */}
        <div className="mb-3 py-2 px-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-primary">
              {formatPrice()}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {getPriceUnit()}
            </span>
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1">
            {getPricingExplanation()}
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={handleViewDetails}
            size="sm"
            className="flex-1 h-8 text-xs"
            variant="outline"
          >
            <Info className="h-3 w-3 mr-1" />
            {t('details')}
          </Button>
          <Button
            onClick={handleContactNow}
            size="sm"
            className="flex-1 h-8 text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {t('contact')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
