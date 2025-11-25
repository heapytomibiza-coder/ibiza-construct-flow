import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformMetric {
  id: string;
  metric_date: string;
  metric_type: string;
  total_users: number;
  new_users: number;
  active_users: number;
  professional_users: number;
  client_users: number;
  total_jobs: number;
  new_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  avg_job_value: number;
  total_revenue: number;
  platform_fees: number;
  escrow_balance: number;
  total_messages: number;
  total_reviews: number;
  avg_rating: number;
  active_disputes: number;
  response_time_ms: number | null;
  error_rate: number | null;
  created_at: string;
  updated_at: string;
}

export const usePlatformMetrics = (startDate: Date, endDate: Date) => {
  const [metrics, setMetrics] = useState<PlatformMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_metrics')
        .select('*')
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .lte('metric_date', endDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: true });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  return {
    metrics,
    isLoading,
    refetch: fetchMetrics
  };
};
