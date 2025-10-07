import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RevenueTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  processed_at: string;
}

export const useRevenueAnalytics = (dateRange?: { start: string; end: string }) => {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['revenue-analytics', dateRange],
    queryFn: async () => {
      let query = (supabase as any)
        .from('revenue_analytics')
        .select('*')
        .order('processed_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('processed_at', dateRange.start)
          .lte('processed_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RevenueTransaction[];
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<RevenueTransaction, 'id'>) => {
      const { data, error } = await (supabase as any)
        .from('revenue_analytics')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });
    },
  });

  const generateReport = useMutation({
    mutationFn: async (params: {
      dateRange: { start: string; end: string };
      filters?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('report-generator', {
        body: {
          reportType: 'revenue',
          dateRange: params.dateRange,
          filters: params.filters,
        },
      });

      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const completedTransactions = transactions?.filter(t => t.status === 'completed').length || 0;

  return {
    transactions,
    totalRevenue,
    completedTransactions,
    isLoading,
    addTransaction: addTransaction.mutate,
    generateReport: generateReport.mutateAsync,
  };
};
