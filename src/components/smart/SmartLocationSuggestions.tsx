import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Home, Building, Compass } from 'lucide-react';

interface SmartLocationSuggestionsProps {
  selectedService?: string;
  onLocationSelect: (location: LocationData) => void;
  className?: string;
}

interface LocationData {
  id: string;
  name: string;
  type: 'area' | 'property' | 'landmark';
  coordinates?: { lat: number; lng: number };
  popularFor?: string[];
  avgResponseTime?: string;
  professionalCount?: number;
}

export const SmartLocationSuggestions = ({ 
  selectedService, 
  onLocationSelect, 
  className 
}: SmartLocationSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);

  const locationData: LocationData[] = [
    {
      id: 'ibiza-town',
      name: 'Ibiza Town',
      type: 'area',
      coordinates: { lat: 38.9065, lng: 1.4206 },
      popularFor: ['plumbing', 'electrical', 'cleaning'],
      avgResponseTime: '2 hours',
      professionalCount: 45
    },
    {
      id: 'san-antonio',
      name: 'San Antonio',
      type: 'area',
      coordinates: { lat: 38.9804, lng: 1.3030 },
      popularFor: ['maintenance', 'cleaning', 'gardening'],
      avgResponseTime: '3 hours',
      professionalCount: 32
    },
    {
      id: 'santa-eulalia',
      name: 'Santa Eulalia',
      type: 'area',
      coordinates: { lat: 38.9869, lng: 1.5322 },
      popularFor: ['carpentry', 'painting', 'electrical'],
      avgResponseTime: '4 hours',
      professionalCount: 28
    },
    {
      id: 'playa-den-bossa',
      name: 'Playa d\'en Bossa',
      type: 'area',
      coordinates: { lat: 38.8724, lng: 1.3998 },
      popularFor: ['cleaning', 'maintenance', 'security'],
      avgResponseTime: '2.5 hours',
      professionalCount: 18
    }
  ];

  useEffect(() => {
    // Smart filtering based on selected service
    if (selectedService) {
      const filtered = locationData
        .filter(location => 
          location.popularFor?.includes(selectedService.toLowerCase()) ||
          location.professionalCount && location.professionalCount > 15
        )
        .sort((a, b) => {
          // Prioritize locations popular for the selected service
          const aPopular = a.popularFor?.includes(selectedService.toLowerCase()) ? 1 : 0;
          const bPopular = b.popularFor?.includes(selectedService.toLowerCase()) ? 1 : 0;
          if (aPopular !== bPopular) return bPopular - aPopular;
          
          // Then by professional count
          return (b.professionalCount || 0) - (a.professionalCount || 0);
        });
      setSuggestions(filtered);
    } else {
      setSuggestions(locationData);
    }
  }, [selectedService]);

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'area':
        return <MapPin className="w-4 h-4" />;
      case 'property':
        return <Home className="w-4 h-4" />;
      case 'landmark':
        return <Building className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Smart Location Suggestions</h3>
          {selectedService && (
            <Badge variant="secondary" className="text-xs">
              Optimized for {selectedService}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          {suggestions.map((location) => {
            const isPopularForService = selectedService && 
              location.popularFor?.includes(selectedService.toLowerCase());
            
            return (
              <div
                key={location.id}
                onClick={() => onLocationSelect(location)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                  ${isPopularForService 
                    ? 'border-primary/20 bg-primary/5' 
                    : 'border-border hover:border-primary/20'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getLocationIcon(location.type)}
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{location.professionalCount} professionals</span>
                        <span>~{location.avgResponseTime} response</span>
                      </div>
                    </div>
                  </div>
                  
                  {isPopularForService && (
                    <Badge variant="default" className="text-xs">
                      Popular for {selectedService}
                    </Badge>
                  )}
                </div>
                
                {location.popularFor && location.popularFor.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {location.popularFor.slice(0, 3).map(service => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};