import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RevenueData {
  analysis_date: string;
  revenue_type: string;
  total_amount: number;
  transaction_count: number;
  average_transaction: number;
  refund_amount: number;
  net_revenue: number;
  currency: string;
}

export const useRevenueAnalytics = (startDate: Date, endDate: Date) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue_analytics')
        .select('*')
        .gte('analysis_date', startDate.toISOString().split('T')[0])
        .lte('analysis_date', endDate.toISOString().split('T')[0])
        .order('analysis_date', { ascending: true });

      if (error) throw error;
      setRevenueData(data || []);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate]);

  return {
    revenueData,
    isLoading,
    refetch: fetchRevenueData
  };
};
