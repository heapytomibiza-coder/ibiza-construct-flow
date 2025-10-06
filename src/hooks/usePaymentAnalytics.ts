import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface PaymentAnalytics {
  total_revenue: number;
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  average_transaction_value: number;
  conversion_rate: number;
  refund_rate: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  payment_count: number;
}

export interface PaymentMethodDistribution {
  payment_method: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface TopRevenueSource {
  job_id: string;
  job_title: string;
  total_revenue: number;
  payment_count: number;
}

export function usePaymentAnalytics(days: number = 30) {
  const startDate = startOfDay(subDays(new Date(), days)).toISOString();
  const endDate = endOfDay(new Date()).toISOString();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<PaymentAnalytics>({
    queryKey: ['payment-analytics', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .rpc('calculate_user_payment_analytics', {
          p_user_id: user.id,
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (error) throw error;
      return data?.[0] || {
        total_revenue: 0,
        total_payments: 0,
        successful_payments: 0,
        failed_payments: 0,
        average_transaction_value: 0,
        conversion_rate: 0,
        refund_rate: 0,
      };
    },
  });

  const { data: revenueTrend, isLoading: trendLoading } = useQuery<RevenueTrend[]>({
    queryKey: ['revenue-trend', days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .rpc('get_revenue_trend', {
          p_user_id: user.id,
          p_days: days,
        });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: paymentMethods, isLoading: methodsLoading } = useQuery<PaymentMethodDistribution[]>({
    queryKey: ['payment-method-distribution', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .rpc('get_payment_method_distribution', {
          p_user_id: user.id,
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: topRevenueSources, isLoading: sourcesLoading } = useQuery<TopRevenueSource[]>({
    queryKey: ['top-revenue-sources', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .rpc('get_top_revenue_sources', {
          p_user_id: user.id,
          p_start_date: startDate,
          p_end_date: endDate,
          p_limit: 10,
        });

      if (error) throw error;
      return data || [];
    },
  });

  return {
    analytics,
    revenueTrend,
    paymentMethods,
    topRevenueSources,
    isLoading: analyticsLoading || trendLoading || methodsLoading || sourcesLoading,
  };
}
