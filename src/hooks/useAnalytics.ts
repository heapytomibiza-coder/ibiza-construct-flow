import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsSummary {
  total_activities: number;
  activity_breakdown: Record<string, number>;
  daily_activity: Array<{ date: string; count: number }>;
}

export interface PlatformMetrics {
  total_users: number;
  active_users: number;
  total_jobs: number;
  active_jobs: number;
  total_bookings: number;
  total_revenue: number;
  user_growth: Array<{ date: string; new_users: number }>;
}

export interface UserActivity {
  id: string;
  activity_type: string;
  entity_type?: string;
  entity_id?: string;
  metadata: any;
  created_at: string;
}

export const useAnalytics = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const { toast } = useToast();

  const fetchUserSummary = async (startDate?: Date, endDate?: Date) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('get_user_analytics_summary', {
        p_user_id: userId,
        p_start_date: startDate?.toISOString(),
        p_end_date: endDate?.toISOString(),
      });

      if (error) throw error;
      setSummary(data as any);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (limit = 50) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities((data || []) as any);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    activityType: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ) => {
    try {
      const { error } = await (supabase as any).from('user_activity_logs').insert({
        user_id: userId,
        activity_type: activityType,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {},
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to log activity:', error);
    }
  };

  return {
    loading,
    summary,
    activities,
    fetchUserSummary,
    fetchActivities,
    logActivity,
  };
};

export const usePlatformAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const { toast } = useToast();

  const fetchPlatformMetrics = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('get_platform_metrics', {
        p_start_date: startDate?.toISOString(),
        p_end_date: endDate?.toISOString(),
      });

      if (error) throw error;
      setMetrics(data as any);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    metrics,
    fetchPlatformMetrics,
  };
};
