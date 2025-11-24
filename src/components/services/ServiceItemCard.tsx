import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ImageCarousel } from './ImageCarousel';

interface ProfessionalServiceItem {
  id: string;
  professional_id: string;
  service_id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: string;
  unit_type: string;
  min_quantity: number;
  max_quantity: number | null;
  bulk_discount_threshold: number | null;
  bulk_discount_price: number | null;
  category: string;
  estimated_duration_minutes: number | null;
  difficulty_level: string;
  is_active: boolean;
  display_order: number;
  primary_image_url?: string;
  gallery_images?: string[];
  video_url?: string;
  image_alt_text?: string;
}

interface ServiceItemCardProps {
  item: ProfessionalServiceItem;
  onSelectionChange: (itemId: string, quantity: number, price: number, pricingType: string, unitType: string) => void;
  viewMode?: 'visual' | 'detailed';
}

export const ServiceItemCard = ({ item, onSelectionChange, viewMode = 'detailed' }: ServiceItemCardProps) => {
  const [quantity, setQuantity] = useState(0);

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getUnitLabel = () => {
    switch (item.unit_type) {
      case 'hours': return 'hour(s)';
      case 'items': return 'item(s)';
      case 'rooms': return 'room(s)';
      case 'sqm': return 'm²';
      case 'linear_meter': return 'linear meter(s)';
      default: return item.unit_type;
    }
  };

  const getPricingTypeLabel = () => {
    switch (item.pricing_type) {
      case 'per_hour': return 'per hour';
      case 'per_unit': return `per ${item.unit_type}`;
      case 'per_square_meter': return 'per m²';
      case 'per_project': return 'per project';
      case 'fixed': return 'fixed price';
      case 'range': return 'from';
      case 'quote_required': return 'quote required';
      default: return item.pricing_type;
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(0, Math.min(newQuantity, item.max_quantity || 999));
    if (clampedQuantity < item.min_quantity && clampedQuantity > 0) {
      return; // Don't allow quantities below minimum
    }
    
    setQuantity(clampedQuantity);
    
    const effectivePrice = item.bulk_discount_threshold && item.bulk_discount_price && clampedQuantity >= item.bulk_discount_threshold
      ? item.bulk_discount_price
      : item.base_price;
    
    onSelectionChange(item.id, clampedQuantity, effectivePrice, item.pricing_type, item.unit_type);
  };

  const getDifficultyColor = () => {
    switch (item.difficulty_level) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const totalPrice = () => {
    const effectivePrice = item.bulk_discount_threshold && item.bulk_discount_price && quantity >= item.bulk_discount_threshold
      ? item.bulk_discount_price
      : item.base_price;
    return effectivePrice * quantity;
  };

  if (item.pricing_type === 'quote_required') {
    return (
      <Card className={`p-4 bg-gradient-card border-2 border-dashed border-copper/30 hover:border-copper/50 transition-colors ${
        viewMode === 'visual' ? 'text-center' : ''
      }`}>
        <div className={`flex items-center ${viewMode === 'visual' ? 'flex-col gap-3' : 'justify-between'}`}>
          {viewMode === 'visual' && (
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">💬</span>
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-charcoal">{item.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            {item.estimated_duration_minutes && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground justify-center">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(item.estimated_duration_minutes)}</span>
              </div>
            )}
          </div>
          <div className={viewMode === 'visual' ? 'w-full' : 'text-right'}>
            <Badge variant="outline" className="bg-copper/10 text-copper border-copper/30">
              Quote Required
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  if (viewMode === 'visual') {
    return (
      <Card className="card-luxury hover:shadow-elegant transition-all duration-300 group overflow-hidden relative">
        {/* Compact Image Section */}
        <div className="relative h-40 overflow-hidden">
          <ImageCarousel
            images={item.gallery_images || []}
            primaryImage={item.primary_image_url}
            videoUrl={item.video_url}
            altText={item.image_alt_text || item.name}
            aspectRatio="video"
            showThumbnails={false}
            className="rounded-none h-full"
          />
          
          {/* Price Badge Overlay */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-white/95 backdrop-blur-sm text-charcoal border-0 font-bold shadow-lg">
              {formatPrice(item.base_price)}
            </Badge>
          </div>
          
          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
            <Button 
              size="sm"
              onClick={() => handleQuantityChange(1)}
              className="btn-premium shadow-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Compact Content */}
        <div className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-charcoal text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {item.name}
              </h4>
              {item.difficulty_level && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1.5 py-0 shrink-0 ${getDifficultyColor()}`}
                >
                  {item.difficulty_level}
                </Badge>
              )}
            </div>

            {/* Compact Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.estimated_duration_minutes && (
                <>
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(item.estimated_duration_minutes)}</span>
                  <span>•</span>
                </>
              )}
              <span className="line-clamp-1">{getPricingTypeLabel()}</span>
            </div>

            {/* Compact Quantity Selector */}
            {quantity > 0 && (
              <div className="flex items-center gap-2 pt-1 animate-fade-in">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
                  className="h-7 w-7 p-0 rounded-full"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="font-bold text-sm">{quantity}</span>
                  <span className="text-xs text-muted-foreground ml-1">{getUnitLabel()}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={item.max_quantity && quantity >= item.max_quantity}
                  className="h-7 w-7 p-0 rounded-full"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                <div className="text-xs font-bold text-copper">
                  {formatPrice(totalPrice())}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Detailed view with full information
  return (
    <Card className="card-luxury overflow-hidden hover:shadow-elegant transition-shadow">
      {/* Full Image Gallery */}
      <div className="relative h-64">
        <ImageCarousel
          images={item.gallery_images || []}
          primaryImage={item.primary_image_url}
          videoUrl={item.video_url}
          altText={item.image_alt_text || item.name}
          aspectRatio="video"
          showThumbnails={true}
          className="rounded-none h-full"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Header with Badges */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-charcoal text-xl">{item.name}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.difficulty_level && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getDifficultyColor()}`}
                    >
                      {item.difficulty_level}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Full Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description || 'No description available'}
            </p>

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {item.estimated_duration_minutes && (
                <div className="flex items-center gap-2 p-3 bg-sand/30 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="font-medium text-sm">{formatDuration(item.estimated_duration_minutes)}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-sand/30 rounded-lg">
                <div className="w-4 h-4 text-primary">📦</div>
                <div>
                  <div className="text-xs text-muted-foreground">Unit</div>
                  <div className="font-medium text-sm">{getUnitLabel()}</div>
                </div>
              </div>
              {item.min_quantity > 1 && (
                <div className="flex items-center gap-2 p-3 bg-sand/30 rounded-lg">
                  <div className="w-4 h-4 text-primary">⚠️</div>
                  <div>
                    <div className="text-xs text-muted-foreground">Min Order</div>
                    <div className="font-medium text-sm">{item.min_quantity} {getUnitLabel()}</div>
                  </div>
                </div>
              )}
              {item.max_quantity && (
                <div className="flex items-center gap-2 p-3 bg-sand/30 rounded-lg">
                  <div className="w-4 h-4 text-primary">📊</div>
                  <div>
                    <div className="text-xs text-muted-foreground">Max Order</div>
                    <div className="font-medium text-sm">{item.max_quantity} {getUnitLabel()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Discount Info */}
            {item.bulk_discount_threshold && item.bulk_discount_price && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <div className="text-sm font-medium text-green-800">Bulk Discount Available</div>
                    <div className="text-xs text-green-600">
                      Save {formatPrice(item.base_price - item.bulk_discount_price)} per unit when ordering {item.bulk_discount_threshold}+ units
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Selection Panel */}
          <div className="min-w-[180px] space-y-4">
            {/* Price Display */}
            <div className="p-4 bg-gradient-subtle rounded-xl border border-sand">
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {getPricingTypeLabel()}
                </div>
                <div className="text-3xl font-bold text-copper">
                  {formatPrice(item.base_price)}
                </div>
                {quantity > 0 && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-sand mt-2">
                    Subtotal: <span className="font-bold text-charcoal">{formatPrice(totalPrice())}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Large Quantity Controls */}
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground text-center uppercase tracking-wide">
                Quantity
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Button
                  variant="outline" 
                  size="lg"
                  onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
                  disabled={quantity <= 0}
                  className="w-12 h-12 p-0 rounded-full"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <div className="w-16 text-center">
                  <div className="text-2xl font-bold">{quantity}</div>
                  <div className="text-xs text-muted-foreground">{getUnitLabel()}</div>
                </div>
                <Button
                  variant="outline" 
                  size="lg"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={item.max_quantity && quantity >= item.max_quantity}
                  className="w-12 h-12 p-0 rounded-full"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              {quantity > 0 && (
                <Button className="w-full btn-premium" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Request
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Validation Warnings */}
        {item.min_quantity > 1 && quantity > 0 && quantity < item.min_quantity && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-800">Minimum order not met</div>
                <div className="text-xs text-amber-600 mt-1">
                  This service requires a minimum order of {item.min_quantity} {getUnitLabel()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};