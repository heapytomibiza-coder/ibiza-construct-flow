import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  CloudRain, 
  Snowflake, 
  Leaf, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  AlertTriangle,
  ThermometerSun
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SeasonalInsightsProps {
  location: { lat: number; lng: number; address: string } | null;
  selectedService?: string;
}

interface SeasonalData {
  season: string;
  icon: React.ReactNode;
  isCurrentSeason: boolean;
  demandTrend: 'high' | 'medium' | 'low';
  popularServices: string[];
  pricing: {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  weatherImpact: string;
  bestBookingTime: string;
  tips: string[];
}

export const SeasonalInsights = ({ 
  location, 
  selectedService 
}: SeasonalInsightsProps) => {
  const { t } = useTranslation('services');
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([]);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    // Get current month to determine season
    const currentMonth = new Date().getMonth();
    const getCurrentSeason = () => {
      if (currentMonth >= 2 && currentMonth <= 4) return 'spring';
      if (currentMonth >= 5 && currentMonth <= 7) return 'summer';
      if (currentMonth >= 8 && currentMonth <= 10) return 'autumn';
      return 'winter';
    };
    
    const currentSeason = getCurrentSeason();

    const data: SeasonalData[] = [
      {
        season: 'summer',
        icon: <Sun className="w-4 h-4" />,
        isCurrentSeason: currentSeason === 'summer',
        demandTrend: 'high',
        popularServices: ['Pool Maintenance', 'Air Conditioning', 'Garden Care', 'Outdoor Cleaning'],
        pricing: { trend: 'up', percentage: 25 },
        weatherImpact: 'Peak tourism season - high demand for all services',
        bestBookingTime: 'Early morning (7-9 AM) or evening (6-8 PM)',
        tips: [
          'Book 2-3 weeks in advance',
          'Consider off-peak hours for better rates',
          'AC repairs are in high demand'
        ]
      },
      {
        season: 'spring',
        icon: <Leaf className="w-4 h-4" />,
        isCurrentSeason: currentSeason === 'spring',
        demandTrend: 'medium',
        popularServices: ['Garden Preparation', 'Deep Cleaning', 'Maintenance', 'Painting'],
        pricing: { trend: 'stable', percentage: 0 },
        weatherImpact: 'Ideal weather for outdoor work and maintenance',
        bestBookingTime: 'Any time during business hours',
        tips: [
          'Great time for home improvements',
          'Prepare gardens before summer heat',
          'Book outdoor work before peak season'
        ]
      },
      {
        season: 'autumn',
        icon: <CloudRain className="w-4 h-4" />,
        isCurrentSeason: currentSeason === 'autumn',
        demandTrend: 'medium',
        popularServices: ['Heating Preparation', 'Weatherproofing', 'Gutter Cleaning', 'Indoor Work'],
        pricing: { trend: 'down', percentage: 15 },
        weatherImpact: 'Moderate weather, good for indoor and covered outdoor work',
        bestBookingTime: 'Flexible scheduling available',
        tips: [
          'Prepare for winter weather',
          'Good discounts available',
          'Focus on weatherproofing'
        ]
      },
      {
        season: 'winter',
        icon: <Snowflake className="w-4 h-4" />,
        isCurrentSeason: currentSeason === 'winter',
        demandTrend: 'low',
        popularServices: ['Heating Repair', 'Indoor Renovations', 'Plumbing', 'Electrical Work'],
        pricing: { trend: 'down', percentage: 20 },
        weatherImpact: 'Limited outdoor work, focus on indoor services',
        bestBookingTime: 'More flexible availability',
        tips: [
          'Best prices of the year',
          'Focus on indoor projects',
          'Plan ahead for spring work'
        ]
      }
    ];

    setSeasonalData(data);
  }, [location]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-600" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!location || seasonalData.length === 0) return null;

  const currentSeasonData = seasonalData.find(s => s.isCurrentSeason);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThermometerSun className="w-5 h-5 text-primary" />
          Seasonal Insights
          {selectedService && (
            <Badge variant="secondary" className="text-xs">
              for {selectedService}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Season Highlight */}
          {currentSeasonData && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {currentSeasonData.icon}
                  <span className="font-medium capitalize">{currentSeasonData.season}</span>
                  <Badge variant="outline" className="text-xs">Current Season</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-xs ${getDemandColor(currentSeasonData.demandTrend)}`}
                    variant="secondary"
                  >
                    {currentSeasonData.demandTrend} demand
                  </Badge>
                  {getTrendIcon(currentSeasonData.pricing.trend)}
                  <span className="text-sm">
                    {currentSeasonData.pricing.trend === 'stable' ? 'Standard' : 
                     `${currentSeasonData.pricing.trend === 'up' ? '+' : '-'}${currentSeasonData.pricing.percentage}%`} pricing
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-600" />
                {currentSeasonData.weatherImpact}
              </div>
              
              <div className="text-sm mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                <strong>Best booking time:</strong> {currentSeasonData.bestBookingTime}
              </div>
              
              {selectedService && currentSeasonData.popularServices.some(service => 
                service.toLowerCase().includes(selectedService.toLowerCase())
              ) && (
                <div className="text-xs text-green-700 bg-green-100 p-2 rounded-md">
                  🎯 {selectedService} is popular this season - expect higher demand!
                </div>
              )}
            </div>
          )}

          {/* All Seasons Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {seasonalData.map((season) => (
              <div 
                key={season.season}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  season.isCurrentSeason 
                    ? 'border-primary/30 bg-primary/10' 
                    : 'border-border hover:border-primary/20'
                } ${
                  expandedSeason === season.season ? 'ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setExpandedSeason(
                  expandedSeason === season.season ? null : season.season
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {season.icon}
                    <span className="text-sm font-medium capitalize">{season.season}</span>
                  </div>
                  {season.isCurrentSeason && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Badge 
                    className={`text-xs ${getDemandColor(season.demandTrend)} w-full justify-center`}
                    variant="secondary"
                  >
                    {season.demandTrend} demand
                  </Badge>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    {getTrendIcon(season.pricing.trend)}
                    <span>
                      {season.pricing.trend === 'stable' ? 'Standard' : 
                       `${season.pricing.trend === 'up' ? '+' : '-'}${season.pricing.percentage}%`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded Season Details */}
          {expandedSeason && (
            <div className="p-4 bg-muted/30 rounded-lg">
              {(() => {
                const season = seasonalData.find(s => s.season === expandedSeason);
                if (!season) return null;
                
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {season.icon}
                      <h4 className="font-medium capitalize">{season.season} Details</h4>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Popular Services:</h5>
                      <div className="flex flex-wrap gap-1">
                        {season.popularServices.map(service => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Tips:</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {season.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};