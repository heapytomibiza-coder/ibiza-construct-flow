import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BusinessInsightsProps {
  userId: string;
  userType: 'professional' | 'client';
}

export function BusinessInsights({ userId, userType }: BusinessInsightsProps) {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['business-insights', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', userId)
        .order('impact_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-business-insights', {
        body: { userId, userType }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-insights', userId] });
      toast.success('New insights generated!');
    },
    onError: () => {
      toast.error('Failed to generate insights');
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_insights')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-insights', userId] });
    }
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue_opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'risk_alert': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'efficiency': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const unreadInsights = insights?.filter(i => !i.is_read) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Business Insights
            {unreadInsights.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadInsights.length} new
              </Badge>
            )}
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating...' : 'Refresh Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading insights...</p>
        ) : !insights || insights.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              No insights yet. Generate AI-powered business insights!
            </p>
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
              Generate Insights
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {insights.map((insight: any) => (
                <div 
                  key={insight.id} 
                  className={`border rounded-lg p-4 ${!insight.is_read ? 'bg-accent/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {getInsightIcon(insight.insight_type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{insight.insight_title}</h4>
                          <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                            {insight.priority}
                          </Badge>
                          {insight.impact_score && (
                            <Badge variant="outline" className="text-xs">
                              Impact: {insight.impact_score}/100
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.insight_description}
                        </p>
                        {insight.action_items && insight.action_items.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Action Items:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {insight.action_items.map((item: string, idx: number) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    {!insight.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate(insight.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
