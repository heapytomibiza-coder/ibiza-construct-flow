import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsInsights } from '@/hooks/useAnalyticsInsights';
import { AlertCircle, TrendingUp, Lightbulb, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const InsightsPanel = () => {
  const { insights, loading, acknowledgeInsight, generateInsights } = useAnalyticsInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'anomaly':
        return <AlertCircle className="h-5 w-5" />;
      case 'prediction':
        return <Lightbulb className="h-5 w-5" />;
      case 'recommendation':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading insights...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI-Powered Insights</CardTitle>
          <Button onClick={generateInsights} variant="outline" size="sm">
            Generate New Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available yet</p>
            <p className="text-sm">Click "Generate New Insights" to analyze your data</p>
          </div>
        )}

        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <div className="flex-shrink-0">
              {getInsightIcon(insight.insight_type)}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant={getSeverityColor(insight.severity)}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => acknowledgeInsight(insight.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {insight.insight_type}
                </Badge>
                <span>
                  {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
