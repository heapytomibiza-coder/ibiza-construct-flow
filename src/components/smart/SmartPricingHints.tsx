import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Info, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PricingHint {
  id: string;
  service_category: string;
  service_subcategory: string;
  micro_service: string;
  location_type: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  sample_size: number;
}

interface SmartPricingHintsProps {
  category?: string;
  subcategory?: string;
  microService?: string;
  location?: string;
  currentBudget?: string;
  onBudgetSuggestion?: (budget: string) => void;
  className?: string;
}

export const SmartPricingHints: React.FC<SmartPricingHintsProps> = ({
  category,
  subcategory,
  microService,
  location,
  currentBudget,
  onBudgetSuggestion,
  className
}) => {
  const [hints, setHints] = useState<PricingHint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHint, setSelectedHint] = useState<PricingHint | null>(null);

  useEffect(() => {
    if (category && subcategory && microService) {
      loadPricingHints();
    }
  }, [category, subcategory, microService, location]);

  const loadPricingHints = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('pricing_hints')
        .select('*');

      // Try to find exact match first
      if (microService) {
        query = query.eq('micro_service', microService);
      }
      if (subcategory) {
        query = query.eq('service_subcategory', subcategory);
      }
      if (category) {
        query = query.eq('service_category', category);
      }

      let { data, error } = await query;
      
      if (error) throw error;

      // If no exact match, try broader categories
      if (!data || data.length === 0) {
        const { data: broaderData, error: broaderError } = await supabase
          .from('pricing_hints')
          .select('*')
          .eq('service_category', category)
          .eq('service_subcategory', subcategory);

        if (!broaderError) {
          data = broaderData;
        }
      }

      setHints(data || []);
      
      // Auto-select best match
      if (data && data.length > 0) {
        const locationMatch = data.find(h => 
          location && h.location_type === getLocationType(location)
        );
        setSelectedHint(locationMatch || data[0]);
      }
    } catch (error) {
      console.error('Error loading pricing hints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationType = (location: string): string => {
    const urbanAreas = ['dublin', 'cork', 'galway', 'limerick', 'waterford'];
    const locationLower = location.toLowerCase();
    
    if (urbanAreas.some(city => locationLower.includes(city))) {
      return 'urban';
    }
    return 'general';
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getBudgetRecommendation = (hint: PricingHint): string => {
    const avgPrice = hint.avg_price;
    
    if (avgPrice < 100) return 'under-100';
    if (avgPrice <= 300) return '100-300';
    if (avgPrice <= 500) return '300-500';
    if (avgPrice <= 1000) return '500-1000';
    return '1000-plus';
  };

  const getBudgetTrend = (hint: PricingHint): 'up' | 'down' | 'stable' => {
    const range = hint.max_price - hint.min_price;
    const avgDeviation = range / hint.avg_price;
    
    if (avgDeviation > 1.5) return 'up';
    if (avgDeviation < 0.5) return 'stable';
    return 'down';
  };

  const getCurrentBudgetAnalysis = () => {
    if (!selectedHint || !currentBudget) return null;

    const budgetRanges: Record<string, [number, number]> = {
      'under-100': [0, 100],
      '100-300': [100, 300],
      '300-500': [300, 500],
      '500-1000': [500, 1000],
      '1000-plus': [1000, 5000]
    };

    const [minBudget, maxBudget] = budgetRanges[currentBudget] || [0, 0];
    const avgPrice = selectedHint.avg_price;

    if (avgPrice < minBudget) {
      return { type: 'high', message: 'Your budget is above typical range' };
    }
    if (avgPrice > maxBudget && maxBudget > 0) {
      return { type: 'low', message: 'Consider increasing budget for better options' };
    }
    return { type: 'good', message: 'Budget aligns well with market rates' };
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading pricing insights...</span>
        </div>
      </Card>
    );
  }

  if (!hints.length || !selectedHint) {
    return null;
  }

  const trend = getBudgetTrend(selectedHint);
  const budgetAnalysis = getCurrentBudgetAnalysis();

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="font-medium">Smart Pricing Insights</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          Based on {selectedHint.sample_size} similar jobs
        </Badge>
      </div>

      {/* Main Pricing Display */}
      <div className="bg-gradient-subtle rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Typical Range</span>
          <div className="flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
            <span className="text-xs text-muted-foreground capitalize">{trend}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatPrice(selectedHint.avg_price)}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Range</div>
            <div className="text-sm">
              {formatPrice(selectedHint.min_price)} - {formatPrice(selectedHint.max_price)}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Analysis */}
      {budgetAnalysis && (
        <div className={`p-3 rounded-lg border ${
          budgetAnalysis.type === 'good' ? 'bg-green-50 border-green-200' :
          budgetAnalysis.type === 'high' ? 'bg-blue-50 border-blue-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            <Info className={`w-4 h-4 ${
              budgetAnalysis.type === 'good' ? 'text-green-600' :
              budgetAnalysis.type === 'high' ? 'text-blue-600' :
              'text-yellow-600'
            }`} />
            <span className="text-sm font-medium">{budgetAnalysis.message}</span>
          </div>
        </div>
      )}

      {/* Location Insights */}
      {hints.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            Location affects pricing
          </div>
          <div className="flex gap-2">
            {hints.map(hint => (
              <Button
                key={hint.id}
                size="sm"
                variant={selectedHint.id === hint.id ? 'default' : 'outline'}
                onClick={() => setSelectedHint(hint)}
                className="text-xs"
              >
                {hint.location_type === 'urban' ? 'Urban' : 'General'}
                <span className="ml-1">{formatPrice(hint.avg_price)}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Budget Suggestion */}
      {onBudgetSuggestion && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBudgetSuggestion(getBudgetRecommendation(selectedHint))}
          className="w-full"
        >
          Use Recommended Budget: {formatPrice(selectedHint.avg_price)}
        </Button>
      )}

      {/* Additional Context */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Market data from {selectedHint.sample_size} completed jobs
        </div>
        <div>Updated recently</div>
      </div>
    </Card>
  );
};