import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, TrendingUp, MapPin } from 'lucide-react';

interface LocationAvailabilityTrackerProps {
  location: { lat: number; lng: number; address: string } | null;
  selectedService?: string;
}

interface AvailabilityData {
  area: string;
  availableNow: number;
  totalProfessionals: number;
  avgWaitTime: string;
  peakHours: string;
  demandLevel: 'low' | 'medium' | 'high';
  trending: 'up' | 'down' | 'stable';
}

export const LocationAvailabilityTracker = ({ 
  location, 
  selectedService 
}: LocationAvailabilityTrackerProps) => {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) return;

    setLoading(true);
    // Simulate API call for real-time availability
    setTimeout(() => {
      const mockData: AvailabilityData[] = [
        {
          area: location.address,
          availableNow: Math.floor(Math.random() * 15) + 5,
          totalProfessionals: Math.floor(Math.random() * 30) + 20,
          avgWaitTime: `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 2) + 2} hours`,
          peakHours: '9 AM - 5 PM',
          demandLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          trending: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
        },
        // Add nearby areas
        {
          area: 'Nearby Area 1',
          availableNow: Math.floor(Math.random() * 12) + 3,
          totalProfessionals: Math.floor(Math.random() * 25) + 15,
          avgWaitTime: `${Math.floor(Math.random() * 4) + 2}-${Math.floor(Math.random() * 3) + 3} hours`,
          peakHours: '10 AM - 6 PM',
          demandLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          trending: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
        },
        {
          area: 'Nearby Area 2',
          availableNow: Math.floor(Math.random() * 10) + 2,
          totalProfessionals: Math.floor(Math.random() * 20) + 10,
          avgWaitTime: `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 4) + 2} hours`,
          peakHours: '8 AM - 4 PM',
          demandLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          trending: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
        }
      ];
      
      setAvailabilityData(mockData);
      setLoading(false);
    }, 1000);
  }, [location, selectedService]);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendingIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  if (!location) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Real-time Availability
          {selectedService && (
            <Badge variant="secondary" className="text-xs">
              for {selectedService}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {availabilityData.map((data, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'border-primary/20 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{data.area}</span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendingIcon(data.trending)}
                    <Badge 
                      className={`text-xs ${getDemandColor(data.demandLevel)}`}
                      variant="secondary"
                    >
                      {data.demandLevel} demand
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-green-600" />
                    <span className="font-medium text-green-600">
                      {data.availableNow}
                    </span>
                    <span className="text-muted-foreground">available</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">{data.totalProfessionals}</span> total
                  </div>
                  <div className="text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {data.avgWaitTime}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Peak: {data.peakHours}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-xs text-muted-foreground mt-3 p-3 bg-muted/30 rounded-lg">
              💡 Tip: Book during off-peak hours for faster response times and better rates.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};