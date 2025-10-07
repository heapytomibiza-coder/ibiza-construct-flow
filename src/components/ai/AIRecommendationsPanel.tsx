import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';

export const AIRecommendationsPanel = () => {
  const { activeRecommendations, isLoading, markAsViewed } = useAIRecommendations();

  if (isLoading) {
    return <div>Loading recommendations...</div>;
  }

  if (!activeRecommendations || activeRecommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No AI recommendations available</p>
      </Card>
    );
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI-Powered Recommendations</h3>
      </div>

      {activeRecommendations.map((recommendation) => (
        <Card key={recommendation.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getPriorityIcon(recommendation.priority)}
                <h4 className="font-medium">{recommendation.title}</h4>
                <Badge variant={getPriorityColor(recommendation.priority) as any}>
                  {recommendation.priority}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>

              {recommendation.recommendation_score && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>Confidence:</span>
                  <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${recommendation.recommendation_score * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(recommendation.recommendation_score * 100)}%</span>
                </div>
              )}

              {recommendation.reasoning && (
                <p className="text-xs text-muted-foreground italic">
                  {recommendation.reasoning}
                </p>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAsViewed(recommendation.id)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};