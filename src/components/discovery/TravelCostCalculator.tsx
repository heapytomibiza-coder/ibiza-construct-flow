import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Calculator, Info, Navigation } from 'lucide-react';

interface TravelCostCalculatorProps {
  location: { lat: number; lng: number; address: string } | null;
  professionalLocations?: Array<{ id: string; name: string; distance: number; location: string }>;
}

interface TravelCost {
  professionalId: string;
  professionalName: string;
  location: string;
  distance: number;
  estimatedCost: number;
  travelTime: string;
  fuelCost: number;
  serviceFee: number;
  total: number;
  isMinimum: boolean;
}

export const TravelCostCalculator = ({ 
  location, 
  professionalLocations = [] 
}: TravelCostCalculatorProps) => {
  const [travelCosts, setTravelCosts] = useState<TravelCost[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!location) return;

    // Generate mock professional locations if none provided
    const mockProfessionals = professionalLocations.length > 0 ? professionalLocations : [
      { id: '1', name: 'Carlos Electrician', distance: 2.3, location: 'Ibiza Town' },
      { id: '2', name: 'Maria Plumbing', distance: 5.7, location: 'San Antonio' },
      { id: '3', name: 'Antonio Handyman', distance: 8.1, location: 'Santa Eulalia' },
      { id: '4', name: 'Sofia Cleaning', distance: 3.2, location: 'Playa d\'en Bossa' },
      { id: '5', name: 'Miguel Gardening', distance: 12.4, location: 'Es Vedra' }
    ];

    // Calculate travel costs
    const costs: TravelCost[] = mockProfessionals.map(prof => {
      const baseFuelRate = 0.15; // €0.15 per km
      const baseServiceFee = prof.distance > 10 ? 25 : prof.distance > 5 ? 15 : 0;
      const fuelCost = prof.distance * baseFuelRate * 2; // Round trip
      const estimatedTime = Math.round(prof.distance / 30 * 60); // Assuming 30 km/h average

      return {
        professionalId: prof.id,
        professionalName: prof.name,
        location: prof.location,
        distance: prof.distance,
        estimatedCost: fuelCost + baseServiceFee,
        travelTime: `${estimatedTime} min`,
        fuelCost: fuelCost,
        serviceFee: baseServiceFee,
        total: fuelCost + baseServiceFee,
        isMinimum: false
      };
    });

    // Mark the professional with minimum cost
    const minCostIndex = costs.reduce((minIdx, cost, idx) => 
      cost.total < costs[minIdx].total ? idx : minIdx, 0
    );
    costs[minCostIndex].isMinimum = true;

    setTravelCosts(costs.sort((a, b) => a.total - b.total));
  }, [location, professionalLocations]);

  if (!location || travelCosts.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Travel Cost Calculator
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
          >
            <Info className="w-3 h-3 mr-1" />
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {travelCosts.slice(0, showDetails ? travelCosts.length : 3).map((cost) => (
            <div 
              key={cost.professionalId}
              className={`p-4 rounded-lg border transition-all ${
                cost.isMinimum 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{cost.professionalName}</span>
                  {cost.isMinimum && (
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-100">
                      Lowest Cost
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">€{cost.total.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">travel cost</div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                {cost.location} • {cost.distance.toFixed(1)} km • {cost.travelTime}
              </div>
              
              {showDetails && (
                <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-3 rounded-md">
                  <div>
                    <span className="font-medium">Fuel Cost:</span> €{cost.fuelCost.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Service Fee:</span> €{cost.serviceFee.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    Calculation: {cost.distance.toFixed(1)} km × 2 (round trip) × €0.15/km + service fee
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {!showDetails && travelCosts.length > 3 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowDetails(true)}
            >
              Show {travelCosts.length - 3} more professionals
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Calculator className="w-4 h-4 inline mr-1 text-blue-600" />
            Travel costs are estimates and may be included in final quotes. Many professionals offer free travel within 5km.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};