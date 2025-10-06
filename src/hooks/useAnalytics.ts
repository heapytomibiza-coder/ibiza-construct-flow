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

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
}

export const useAnalytics = (startDate?: Date, endDate?: Date) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_dashboard_kpis');

      if (rpcError) throw rpcError;
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setKpis(data as unknown as DashboardKPIs);
      }
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

export const usePlatformAnalytics = (startDate?: Date, endDate?: Date) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.rpc('get_dashboard_kpis');
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching platform metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [startDate, endDate]);

  return { metrics, isLoading };
};
