/**
 * Insights Panel Component
 * Phase 11: Professional Tools & Insights
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useProfessionalActions } from '@/hooks/professional';

type ProfessionalInsight = Database['public']['Tables']['professional_insights']['Row'];

interface InsightsPanelProps {
  insights: ProfessionalInsight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const { markInsightAsRead } = useProfessionalActions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return AlertCircle;
      case 'high': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const unreadInsights = insights.filter(i => !i.is_read);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Insights</CardTitle>
            <CardDescription>
              AI-powered recommendations to grow your business
            </CardDescription>
          </div>
          {unreadInsights.length > 0 && (
            <Badge variant="default">{unreadInsights.length} new</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No insights available yet. Keep working to receive personalized recommendations!
          </p>
        ) : (
          insights.map((insight) => {
            const Icon = getPriorityIcon(insight.priority);
            return (
              <div
                key={insight.id}
                className={`p-4 border rounded-lg ${!insight.is_read ? 'bg-accent/50' : 'bg-background'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 mt-0.5 text-primary" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{insight.insight_title}</h4>
                        <Badge variant={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.insight_description}
                      </p>
                      {insight.action_items && Array.isArray(insight.action_items) && (insight.action_items as any[]).length > 0 && (
                        <ul className="text-sm space-y-1 mt-2">
                          {(insight.action_items as any[]).map((item: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {!insight.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markInsightAsRead.mutate(insight.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
