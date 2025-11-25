import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, CheckCircle, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ReviewSummary } from '@/hooks/reviews/useReviewSummary';

interface AISummaryCardProps {
  summary: ReviewSummary | null;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  showRegenerateButton?: boolean;
}

export const AISummaryCard = ({ 
  summary, 
  onRegenerate,
  isGenerating,
  showRegenerateButton = false,
}: AISummaryCardProps) => {
  if (!summary) {
    return showRegenerateButton ? (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-semibold mb-2">No AI Summary Yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Generate an AI-powered professional overview from reviews
          </p>
          <Button onClick={onRegenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    ) : null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI-Powered Professional Overview</CardTitle>
          </div>
          {showRegenerateButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Based on {summary.reviews_analyzed} reviews</span>
          <span>•</span>
          <span>Updated {formatDistanceToNow(new Date(summary.last_generated_at), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Summary Text */}
        <div>
          <p className="text-muted-foreground leading-relaxed">
            {summary.summary_text}
          </p>
        </div>

        {/* Key Strengths */}
        {summary.key_strengths && summary.key_strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Key Strengths
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.key_strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Common Praise */}
        {summary.common_praise && summary.common_praise.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              What Clients Love
            </h4>
            <ul className="space-y-2">
              {summary.common_praise.map((praise, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{praise}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas Mentioned */}
        {summary.areas_mentioned && summary.areas_mentioned.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {summary.areas_mentioned.map((area, index) => (
              <Badge key={index} variant="outline">
                {area}
              </Badge>
            ))}
          </div>
        )}

        {/* Confidence Indicator */}
        {summary.confidence_score && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>AI Confidence</span>
              <span className="font-medium">
                {(summary.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
