import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PlatformMetric = Database['public']['Tables']['platform_metrics']['Row'];
type AdminActivityFeed = Database['public']['Tables']['admin_activity_feed']['Row'];
type UserAnalytics = Database['public']['Tables']['user_analytics']['Row'];
type CategoryAnalytics = Database['public']['Tables']['category_analytics']['Row'];

export const useAdminAnalytics = () => {
  // Platform metrics
  const { data: platformMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as PlatformMetric[];
    },
  });

  // Activity feed
  const { data: activityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AdminActivityFeed[];
    },
  });

  // User analytics summary
  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useQuery({
    queryKey: ['user-analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('analytics_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('analytics_date', { ascending: false });

      if (error) throw error;
      return data as UserAnalytics[];
    },
  });

  // Category analytics
  const { data: categoryAnalytics, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_analytics')
        .select('*')
        .gte('analytics_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('analytics_date', { ascending: false });

      if (error) throw error;
      return data as CategoryAnalytics[];
    },
  });

  return {
    platformMetrics,
    activityFeed,
    userAnalytics,
    categoryAnalytics,
    isLoading: metricsLoading || activityLoading || userAnalyticsLoading || categoryLoading,
  };
};