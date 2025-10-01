import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, Sparkles, Loader2 } from 'lucide-react';
import { useAIQuestions } from '@/hooks/useAIQuestions';

interface PriceEstimatorProps {
  microId: string;
  category: string;
  subcategory: string;
  answers: Record<string, any>;
  location?: string;
}

export const PriceEstimator: React.FC<PriceEstimatorProps> = ({
  microId,
  category,
  subcategory,
  answers,
  location
}) => {
  const { priceEstimate, loading, estimatePrice } = useAIQuestions();
  const [shouldEstimate, setShouldEstimate] = useState(false);

  useEffect(() => {
    // Only estimate when we have sufficient answers
    const answerCount = Object.keys(answers).filter(key => 
      answers[key] !== undefined && answers[key] !== ''
    ).length;

    if (answerCount >= 2 && !loading && !priceEstimate) {
      setShouldEstimate(true);
      estimatePrice(microId, category, subcategory, answers, location);
    }
  }, [answers, microId, category, subcategory, location]);

  if (!shouldEstimate && !priceEstimate) return null;

  if (loading) {
    return (
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Calculating price estimate...
          </span>
        </div>
      </Card>
    );
  }

  if (!priceEstimate) return null;

  const { estimatedPrice, confidenceLevel, priceFactors, timeline } = priceEstimate;
  
  const confidenceColors = {
    high: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    low: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
  };

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI Price Estimate</h3>
          </div>
          <Badge className={confidenceColors[confidenceLevel]}>
            {confidenceLevel} confidence
          </Badge>
        </div>

        <div className="flex items-baseline gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <div>
            <div className="text-3xl font-bold text-primary">
              ${estimatedPrice.min.toLocaleString()} - ${estimatedPrice.max.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">{estimatedPrice.currency}</p>
          </div>
        </div>

        {priceFactors && priceFactors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Price Factors</span>
            </div>
            <ul className="space-y-1">
              {priceFactors.slice(0, 3).map((factor, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {timeline && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expected timeline: {timeline}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground italic border-t pt-3">
          This is an AI-generated estimate. Final prices may vary based on professional quotes.
        </p>
      </div>
    </Card>
  );
};
