import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

export function useRevenueAnalytics(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: payments, error: paymentsError } = await supabase
          .from('payment_transactions')
          .select('created_at, amount, status')
          .in('status', ['completed', 'succeeded'])
          .order('created_at', { ascending: true });

        if (paymentsError) throw paymentsError;

        // Group by date
        const grouped = (payments || []).reduce((acc: Record<string, { revenue: number; count: number }>, payment) => {
          const date = new Date(payment.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { revenue: 0, count: 0 };
          }
          acc[date].revenue += payment.amount || 0;
          acc[date].count += 1;
          return acc;
        }, {});

        const revenueData = Object.entries(grouped).map(([date, stats]) => ({
          date,
          revenue: stats.revenue,
          transactions: stats.count,
        }));

        setData(revenueData);
      } catch (err) {
        console.error('Error fetching revenue:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
