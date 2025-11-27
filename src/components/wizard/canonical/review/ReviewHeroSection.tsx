import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar, Wrench } from 'lucide-react';

interface ReviewHeroSectionProps {
  serviceName: string;
  category?: string;
  subcategory?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  categoryColor?: string;
}

export const ReviewHeroSection: React.FC<ReviewHeroSectionProps> = ({
  serviceName,
  category,
  subcategory,
  location,
  budget,
  timeline,
  categoryColor = '#D4A574'
}) => {
  const badges = [
    { icon: MapPin, label: location, show: !!location },
    { icon: DollarSign, label: budget, show: !!budget },
    { icon: Calendar, label: timeline, show: !!timeline },
    { icon: Wrench, label: serviceName, show: true }
  ].filter(b => b.show);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sage-light/30 via-background to-background border border-sage-muted/20 p-8 mb-6">
      {/* Decorative gradient overlay */}
      <div 
        className="absolute top-0 left-0 w-full h-1 opacity-60"
        style={{ 
          background: `linear-gradient(90deg, ${categoryColor}, transparent)` 
        }}
      />
      
      <div className="space-y-4">
        {/* Breadcrumb */}
        {(category || subcategory) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {category && <span>{category}</span>}
            {category && subcategory && <span>→</span>}
            {subcategory && <span>{subcategory}</span>}
          </div>
        )}

        {/* Main title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Review Your Job Request
          </h1>
          <p className="text-muted-foreground text-base">
            Double-check the details before submitting to professionals
          </p>
        </div>

        {/* Key stat badges */}
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, idx) => {
            const IconComponent = badge.icon;
            return (
              <Badge
                key={idx}
                variant="outline"
                className="gap-2 px-3 py-1.5 bg-background/80 border-sage-muted/30 hover:bg-background"
              >
                <IconComponent className="w-4 h-4" style={{ color: categoryColor }} />
                <span className="text-sm font-medium">{badge.label}</span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};
