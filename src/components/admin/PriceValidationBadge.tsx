import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PriceValidationBadgeProps {
  serviceType: string;
  category: string;
  subcategory?: string;
  currentPrice: number;
  location?: string;
  professionalId?: string;
  onValidationComplete?: (result: any) => void;
}

interface ValidationResult {
  marketPosition: 'below_market' | 'market_aligned' | 'above_market';
  confidenceScore: number;
  analysis: string;
  suggestedRange: {
    min: number;
    max: number;
  };
  marketData: {
    avgPrice: number;
    sampleSize: number;
  };
}

export default function PriceValidationBadge({
  serviceType,
  category,
  subcategory,
  currentPrice,
  location = 'general',
  professionalId,
  onValidationComplete
}: PriceValidationBadgeProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (currentPrice > 0) {
      validatePrice();
    }
  }, [currentPrice, serviceType, category, subcategory]);

  const validatePrice = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-price-validator', {
        body: {
          serviceType,
          location,
          pricingData: {
            hourly_rate: currentPrice,
            category,
            subcategory,
            professional_id: professionalId
          },
          category,
          subcategory
        }
      });

      if (error) throw error;

      if (data) {
        const result: ValidationResult = {
          marketPosition: data.marketPosition || 'market_aligned',
          confidenceScore: data.confidenceScore || 0.8,
          analysis: data.analysis || 'Price appears to be within market range',
          suggestedRange: data.suggestedRange || { min: currentPrice * 0.8, max: currentPrice * 1.2 },
          marketData: data.marketData || { avgPrice: currentPrice, sampleSize: 1 }
        };
        
        setValidation(result);
        onValidationComplete?.(result);
      }
    } catch (error) {
      console.error('Error validating price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (position: string) => {
    switch (position) {
      case 'below_market':
        return 'secondary';
      case 'above_market':
        return 'destructive';
      case 'market_aligned':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'below_market':
        return <TrendingDown className="h-3 w-3" />;
      case 'above_market':
        return <TrendingUp className="h-3 w-3" />;
      case 'market_aligned':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'below_market':
        return 'Below Market';
      case 'above_market':
        return 'Above Market';
      case 'market_aligned':
        return 'Market Aligned';
      default:
        return 'Unknown';
    }
  };

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Validating...
      </Badge>
    );
  }

  if (!validation) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={validatePrice}
        className="h-6 px-2 text-xs"
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        Validate
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getBadgeVariant(validation.marketPosition)} 
              className="flex items-center gap-1 cursor-help"
            >
              {getPositionIcon(validation.marketPosition)}
              {getPositionLabel(validation.marketPosition)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <Card className="w-80 border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Price Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  Confidence: {Math.round(validation.confidenceScore * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Current Rate:</span>
                    <span className="font-semibold">{formatPrice(currentPrice)}/hr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Market Average:</span>
                    <span>{formatPrice(validation.marketData.avgPrice)}/hr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Suggested Range:</span>
                    <span>
                      {formatPrice(validation.suggestedRange.min)} - {formatPrice(validation.suggestedRange.max)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {validation.analysis}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on {validation.marketData.sampleSize} similar professionals
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipContent>
        </Tooltip>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={validatePrice}
          className="h-5 w-5 p-0"
        >
          <AlertTriangle className="h-3 w-3" />
        </Button>
      </div>
    </TooltipProvider>
  );
}