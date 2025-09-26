import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface LocationBasedDiscoveryProps {
  onLocationChange: (location: { lat: number; lng: number; address: string } | null) => void;
  currentLocation: { lat: number; lng: number; address: string } | null;
}

export const LocationBasedDiscovery = ({ onLocationChange, currentLocation }: LocationBasedDiscoveryProps) => {
  const { t } = useTranslation('services');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address (using a simple approximation for Ibiza)
          const address = await reverseGeocode(latitude, longitude);
          onLocationChange({ lat: latitude, lng: longitude, address });
        } catch (error) {
          // Fallback to coordinates if reverse geocoding fails
          onLocationChange({ 
            lat: latitude, 
            lng: longitude, 
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          });
        }
        setIsLocating(false);
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please try again.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Simple Ibiza location approximation
    const ibizaAreas = [
      { name: 'Ibiza Town', lat: 38.9067, lng: 1.4205, radius: 0.05 },
      { name: 'San Antonio', lat: 38.9804, lng: 1.3030, radius: 0.05 },
      { name: 'Santa Eulalia', lat: 38.9870, lng: 1.5345, radius: 0.05 },
      { name: 'Playa d\'en Bossa', lat: 38.8764, lng: 1.3947, radius: 0.03 },
      { name: 'Es Vedra', lat: 38.8661, lng: 1.2006, radius: 0.03 },
      { name: 'San José', lat: 38.8934, lng: 1.2906, radius: 0.05 }
    ];

    for (const area of ibizaAreas) {
      const distance = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (distance < area.radius) {
        return area.name;
      }
    }

    return 'Ibiza, Spain';
  };

  const clearLocation = () => {
    onLocationChange(null);
    setLocationError(null);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">Location-based Discovery</span>
          </div>
          
          <div className="flex items-center gap-2">
            {currentLocation ? (
              <>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {currentLocation.address}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearLocation}
                >
                  Clear
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {isLocating ? 'Locating...' : 'Use My Location'}
              </Button>
            )}
          </div>
        </div>
        
        {locationError && (
          <p className="text-sm text-destructive mt-2">{locationError}</p>
        )}
        
        {currentLocation && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing services and professionals near you
          </p>
        )}
      </CardContent>
    </Card>
  );
};