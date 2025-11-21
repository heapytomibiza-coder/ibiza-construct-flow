import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Euro, Clock, MapPin, Star } from 'lucide-react';

interface Props {
  serviceType: any;
  details: any;
  media: any;
}

export const LiveServicePreview: React.FC<Props> = ({ serviceType, details, media }) => {
  const hasContent = serviceType?.label || details?.serviceName;

  if (!hasContent) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Live Preview</p>
          <p className="text-xs mt-2">Fill in the form to see how your service will appear to clients</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        How clients will see it:
      </div>
      
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        {media?.primaryImageUrl && (
          <div className="relative h-48 bg-muted">
            <img
              src={media.primaryImageUrl}
              alt={details?.serviceName || 'Service'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
              {serviceType?.label || 'Service'}
            </Badge>
          </div>
        )}

        {!media?.primaryImageUrl && (
          <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No image yet</p>
              <p className="text-xs">Add one in the Media section</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">
              {details?.serviceName || 'Service Name'}
            </h3>
            {serviceType?.label && !details?.serviceName && (
              <p className="text-sm text-muted-foreground">{serviceType.label}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            {details?.pricing === 'fixed' && details?.basePrice ? (
              <span className="font-semibold text-primary">€{details.basePrice}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Quote Required</span>
            )}
          </div>

          {/* Duration */}
          {details?.duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {details.duration}
            </div>
          )}

          {/* Description Preview */}
          {details?.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {details.description}
            </p>
          )}

          {/* CTA */}
          <div className="pt-2">
            <Button className="w-full" disabled>
              Book Now
            </Button>
          </div>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          </div>
        </div>
      </Card>

      {/* Tip */}
      <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Tip: Services with photos get 3x more bookings
        </p>
      </Card>
    </div>
  );
};
