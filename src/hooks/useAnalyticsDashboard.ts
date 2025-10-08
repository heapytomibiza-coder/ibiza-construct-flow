import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// ---------- Types ----------
const SummarySchema = z.object({
  total_jobs_completed: z.number().nonnegative().default(0),
  total_jobs_posted: z.number().nonnegative().default(0),
  total_revenue: z.number().default(0),
  total_spending: z.number().default(0),
  average_rating: z.number().min(0).max(5).default(0),
  response_time_avg: z.number().nonnegative().default(0),
  completion_rate: z.number().min(0).max(1).default(0),
});

const DashboardStatsSchema = z.object({
  summary: SummarySchema,
  monthlyRevenue: z.number().default(0),
});

type DashboardStats = z.infer<typeof DashboardStatsSchema>;

const InsightSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  insight_type: z.string(),
  insight_title: z.string(),
  insight_description: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  action_items: z.any().optional(),
  impact_score: z.number().nullable().optional(),
  is_read: z.boolean().default(false),
  created_at: z.string(),
});

type Insight = z.infer<typeof InsightSchema>;

// local priority weight for deterministic sorting (fallback if DB sorting fails)
const weight = (p: Insight['priority']) =>
  p === 'high' ? 3 : p === 'medium' ? 2 : 1;

// ---------- Hook ----------
export const useAnalyticsDashboard = () => {
  const queryClient = useQueryClient();

  // Get current user id once for scoping & query keys
  const userIdPromise = supabase.auth.getUser().then(({ data }) => data.user?.id ?? null);

  // Dashboard stats (via edge function)
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['analytics-dashboard', userIdPromise],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase.functions.invoke('analytics-processor', {
        body: { action: 'get_dashboard_stats' },
      });
      
      if (error) throw error;
      
      // Guard against 200 OK with error payload
      if (data?.error) {
        throw new Error(data.error.message ?? 'Analytics stats unavailable');
      }
      
      return DashboardStatsSchema.parse(data);
    },
    staleTime: 60_000, // 1 min
    retry: 2,
  });

  // Business insights (table) — scoped to user + unread
  const {
    data: insightsRaw,
    isLoading: isLoadingInsights,
    error: insightsError,
  } = useQuery({
    queryKey: ['business-insights', userIdPromise],
    queryFn: async (): Promise<Insight[]> => {
      const userId = await userIdPromise;
      if (!userId) return [];

      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', userId)      // RLS-friendly: only my insights
        .eq('is_read', false)
        .order('priority_weight', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed = z.array(InsightSchema).parse(data ?? []);
      
      // Client-side fallback sorting if priority_weight isn't available
      return parsed.sort((a, b) => {
        const weightDiff = weight(b.priority) - weight(a.priority);
        if (weightDiff !== 0) return weightDiff;
        return a.created_at < b.created_at ? 1 : -1;
      });
    },
    staleTime: 30_000,
    retry: 2,
  });

  // Track an analytics event (edge function)
  const trackEvent = useMutation({
    mutationFn: async (event: {
      event_type: string;
      event_category: string;
      event_data?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.functions.invoke('analytics-processor', {
        body: { action: 'track_event', data: event },
      });
      if (error) throw error;
      return data as { id: string };
    },
  });

  // Mark insight as read (optimistic update)
  const markInsightAsRead = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('business_insights')
        .update({ is_read: true })
        .eq('id', insightId);
      if (error) throw error;
    },
    onMutate: async (insightId) => {
      await queryClient.cancelQueries({ queryKey: ['business-insights', userIdPromise] });
      const prev = queryClient.getQueryData<Insight[]>(['business-insights', userIdPromise]);
      if (prev) {
        queryClient.setQueryData<Insight[]>(
          ['business-insights', userIdPromise],
          prev.filter((i) => i.id !== insightId),
        );
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['business-insights', userIdPromise], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['business-insights', userIdPromise] });
    },
  });

  // Generate insights (edge function) + refresh
  const generateInsights = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-processor', {
        body: { action: 'generate_insights' },
      });
      
      if (error) throw error;
      
      // Guard against 200 OK with error payload
      if (data?.error) {
        throw new Error(data.error.message ?? 'Insight generation failed');
      }
      
      return data as { generated: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-insights', userIdPromise] });
    },
  });

  return {
    stats,
    insights: insightsRaw ?? [],
    isLoading: isLoadingStats || isLoadingInsights,
    errors: { statsError, insightsError },
    // mutations
    trackEvent: trackEvent.mutate,
    markInsightAsRead: markInsightAsRead.mutate,
    generateInsights: generateInsights.mutate,
  };
};
