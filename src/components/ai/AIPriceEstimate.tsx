import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceEstimate } from '@/hooks/useAIQuestions';
import { DollarSign, Clock, TrendingUp, Info } from 'lucide-react';

interface AIPriceEstimateProps {
  estimate: PriceEstimate;
}

export const AIPriceEstimate: React.FC<AIPriceEstimateProps> = ({ estimate }) => {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          AI Price Estimate
        </CardTitle>
        <Badge className={getConfidenceColor(estimate.confidenceLevel)}>
          {estimate.confidenceLevel.toUpperCase()} CONFIDENCE
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-blue-600">
              ${estimate.estimatedPrice.min} - ${estimate.estimatedPrice.max}
            </div>
            <div className="text-sm text-blue-600/80">
              Estimated price range ({estimate.estimatedPrice.currency})
            </div>
          </div>
        </div>

        {/* Timeline */}
        {estimate.timeline && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-gray-600" />
            <div>
              <div className="font-medium">Timeline</div>
              <div className="text-sm text-gray-600">{estimate.timeline}</div>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Estimate Explanation</span>
          </div>
          <p className="text-sm text-gray-600 pl-6">{estimate.explanation}</p>
        </div>

        {/* Price Factors */}
        {estimate.priceFactors && estimate.priceFactors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Factors affecting price:</h4>
            <ul className="space-y-1">
              {estimate.priceFactors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          * This is an AI-generated estimate based on your responses. Actual prices may vary based on professional quotes and market conditions.
        </div>
      </CardContent>
    </Card>
  );
};