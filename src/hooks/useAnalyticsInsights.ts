import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsInsight {
  id: string;
  insight_type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  data: Record<string, any>;
  created_at: string;
}

export const useAnalyticsInsights = () => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('analytics-insights')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_insights'
        },
        (payload) => {
          setInsights((prev) => [payload.new as AnalyticsInsight, ...prev]);
          
          const insight = payload.new as AnalyticsInsight;
          if (insight.severity === 'critical') {
            toast({
              title: insight.title,
              description: insight.description,
              variant: 'destructive'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('analytics_insights')
        .select('*')
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setInsights(data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeInsight = async (insightId: string) => {
    const user = await supabase.auth.getUser();
    
    const { error } = await (supabase as any)
      .from('analytics_insights')
      .update({
        is_acknowledged: true,
        acknowledged_by: user.data.user?.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (!error) {
      setInsights((prev) => prev.filter((i) => i.id !== insightId));
    }
  };

  const generateInsights = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-analytics-insights');
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Analytics insights generated successfully'
      });
      
      await fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights',
        variant: 'destructive'
      });
    }
  };

  return {
    insights,
    loading,
    acknowledgeInsight,
    generateInsights,
    refresh: fetchInsights
  };
};
