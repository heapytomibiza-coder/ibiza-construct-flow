/**
 * Revenue Forecast Panel Component
 * Phase 11: Professional Tools & Insights
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RevenueForecast = Database['public']['Tables']['revenue_forecasts']['Row'];

interface RevenueForecastPanelProps {
  forecasts: RevenueForecast[];
}

export function RevenueForecastPanel({ forecasts }: RevenueForecastPanelProps) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: 'default' as const, label: 'High Confidence' };
    if (confidence >= 0.6) return { variant: 'secondary' as const, label: 'Medium Confidence' };
    return { variant: 'outline' as const, label: 'Low Confidence' };
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Next Week';
      case 'month': return 'Next Month';
      case 'quarter': return 'Next Quarter';
      case 'year': return 'Next Year';
      default: return period;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Revenue Forecasts
        </CardTitle>
        <CardDescription>
          AI-powered revenue predictions based on your performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {forecasts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Complete more jobs to generate revenue forecasts
          </p>
        ) : (
          <div className="space-y-4">
            {forecasts.map((forecast) => {
              const confidence = getConfidenceBadge(Number(forecast.confidence_level));
              return (
                <div key={forecast.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{getPeriodLabel(forecast.forecast_period)}</span>
                    </div>
                    <Badge variant={confidence.variant}>{confidence.label}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      ${Number(forecast.projected_revenue).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Projected revenue
                    </p>
                  </div>

                  {forecast.contributing_factors && Array.isArray(forecast.contributing_factors) && (forecast.contributing_factors as any[]).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Key factors:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(forecast.contributing_factors as any[]).map((factor: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
