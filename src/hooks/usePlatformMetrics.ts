import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformMetric {
  metric_date: string;
  metric_hour: number | null;
  total_users: number;
  active_users: number;
  new_users: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  total_messages: number;
  total_reviews: number;
  average_rating: number;
  disputes_opened: number;
  disputes_resolved: number;
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
