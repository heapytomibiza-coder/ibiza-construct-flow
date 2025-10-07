import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  summary: {
    total_jobs_completed: number;
    total_jobs_posted: number;
    total_revenue: number;
    total_spending: number;
    average_rating: number;
    response_time_avg: number;
    completion_rate: number;
  };
  monthlyRevenue: number;
}

export const useAnalyticsDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-processor', {
        body: { action: 'get_dashboard_stats' }
      });

      if (error) throw error;
      return data as DashboardStats;
    },
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['business-insights'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('business_insights')
        .select('*')
        .eq('is_read', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const trackEvent = useMutation({
    mutationFn: async (eventData: {
      event_type: string;
      event_category: string;
      event_data?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('analytics-processor', {
        body: {
          action: 'track_event',
          data: eventData,
        },
      });

      if (error) throw error;
      return data;
    },
  });

  const markInsightAsRead = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await (supabase as any)
        .from('business_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-insights'] });
    },
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-processor', {
        body: { action: 'generate_insights' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-insights'] });
    },
  });

  return {
    stats,
    insights,
    isLoading: isLoadingStats || isLoadingInsights,
    trackEvent: trackEvent.mutate,
    markInsightAsRead: markInsightAsRead.mutate,
    generateInsights: generateInsights.mutate,
  };
};
