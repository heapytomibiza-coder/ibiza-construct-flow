import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardKPIs {
  total_users: number;
  active_users: number;
  new_users: number;
  total_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  average_rating: number;
  active_disputes: number;
}

export const useAnalytics = (startDate?: Date, endDate?: Date) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_dashboard_kpis', {
        p_start_date: startDate?.toISOString().split('T')[0] || null,
        p_end_date: endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      });

      if (rpcError) throw rpcError;
      setKpis(data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [startDate, endDate]);

  return {
    kpis,
    isLoading,
    error,
    refetch: fetchKPIs
  };
};
