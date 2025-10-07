import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePredictiveInsights } from '@/hooks/usePredictiveInsights';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

interface PredictiveInsightsCardProps {
  insightType?: 'demand_forecast' | 'churn_risk' | 'price_optimization' | 'booking_likelihood';
}

export const PredictiveInsightsCard = ({ insightType }: PredictiveInsightsCardProps) => {
  const { validInsights, isLoading } = usePredictiveInsights(insightType);

  if (isLoading) {
    return <div>Loading insights...</div>;
  }

  if (!validInsights || validInsights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'demand_forecast':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'churn_risk':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'price_optimization':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'booking_likelihood':
        return <TrendingDown className="h-5 w-5 text-blue-600" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'demand_forecast':
        return 'Demand Forecast';
      case 'churn_risk':
        return 'Churn Risk';
      case 'price_optimization':
        return 'Price Optimization';
      case 'booking_likelihood':
        return 'Booking Likelihood';
      default:
        return 'Insight';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {validInsights.slice(0, 6).map((insight) => (
        <Card key={insight.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getInsightIcon(insight.insight_type)}
              <h4 className="font-semibold text-sm">{getInsightTitle(insight.insight_type)}</h4>
            </div>
            {insight.confidence_score && (
              <Badge variant="secondary">
                {Math.round(insight.confidence_score * 100)}%
              </Badge>
            )}
          </div>

          {insight.prediction_value !== undefined && (
            <div className="text-2xl font-bold mb-2">
              {insight.insight_type === 'price_optimization' && '$'}
              {insight.prediction_value}
              {insight.insight_type === 'booking_likelihood' && '%'}
            </div>
          )}

          {insight.factors && insight.factors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-1">Key Factors:</p>
              {insight.factors.slice(0, 3).map((factor: string, idx: number) => (
                <p key={idx} className="text-xs text-muted-foreground">
                  • {factor}
                </p>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};