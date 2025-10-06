import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserStatistics {
  total_users: number;
  new_users: number;
  active_users: number;
  professionals: number;
  clients: number;
  avg_session_duration: number;
}

export interface UserCohort {
  id: string;
  name: string;
  description: string | null;
  cohort_type: string;
  criteria: Record<string, any>;
  user_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserActivitySummary {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  total_sessions: number;
  total_time_seconds: number;
  jobs_created: number;
  jobs_completed: number;
  messages_sent: number;
  reviews_given: number;
  revenue_generated: number;
  metadata: Record<string, any>;
  created_at: string;
}

export function useUserAnalytics() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getUserStatistics = async (start_date?: Date, end_date?: Date) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_statistics' as any, {
        p_start_date: start_date?.toISOString(),
        p_end_date: end_date?.toISOString(),
      } as any);

      if (error) throw error;
      return data as any as UserStatistics;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCohorts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_cohorts' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as UserCohort[];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCohort = async (
    name: string,
    cohort_type: string,
    criteria: Record<string, any>,
    description?: string
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_cohorts' as any)
        .insert({
          name,
          cohort_type,
          criteria,
          description,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Cohort Created',
        description: `Cohort "${name}" has been created.`,
      });

      return data as unknown as UserCohort;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserActivity = async (userId: string, limit: number = 30) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_summary' as any)
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as UserActivitySummary[];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTopUsers = async (metric: string = 'revenue_generated', limit: number = 10) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_summary' as any)
        .select('user_id, profiles(full_name), SUM(revenue_generated) as total_revenue')
        .order('total_revenue', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserStatistics,
    getCohorts,
    createCohort,
    getUserActivity,
    getTopUsers,
  };
}
