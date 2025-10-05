import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

export interface PaymentAnalytics {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  total_revenue: number;
  total_expenses: number;
  total_escrow: number;
  total_refunds: number;
  transaction_count: number;
  unique_clients: number;
  unique_professionals: number;
  average_transaction: number;
  payment_method_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface FinancialReport {
  id: string;
  user_id: string;
  report_type: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'tax_summary' | 'payout_summary';
  report_name: string;
  period_start: string;
  period_end: string;
  report_data: any;
  file_url?: string;
  status: 'generating' | 'completed' | 'failed';
  generated_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const usePaymentAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<PaymentAnalytics[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (periodType: 'monthly' | 'yearly' = 'monthly') => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('payment_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('period_type', periodType)
        .order('period_start', { ascending: false })
        .limit(12);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchReports = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('financial_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
      fetchReports();
    }

    // Set up real-time subscriptions
    const analyticsChannel = (supabase as any)
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_analytics',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    const reportsChannel = (supabase as any)
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_reports',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, [userId, fetchAnalytics, fetchReports]);

  const generateReport = async (
    reportType: FinancialReport['report_type'],
    periodStart: Date,
    periodEnd: Date
  ) => {
    if (!userId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('financial_reports')
        .insert({
          user_id: userId,
          report_type: reportType,
          report_name: `${reportType.replace('_', ' ')} - ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          status: 'generating',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Report generation started');
      fetchReports();
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      throw error;
    }
  };

  const getMonthlyComparison = useCallback(() => {
    if (analytics.length < 2) return null;

    const current = analytics[0];
    const previous = analytics[1];

    return {
      revenue: {
        current: current.total_revenue,
        previous: previous.total_revenue,
        change: ((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100,
      },
      transactions: {
        current: current.transaction_count,
        previous: previous.transaction_count,
        change: ((current.transaction_count - previous.transaction_count) / previous.transaction_count) * 100,
      },
      average: {
        current: current.average_transaction,
        previous: previous.average_transaction,
        change: ((current.average_transaction - previous.average_transaction) / previous.average_transaction) * 100,
      },
    };
  }, [analytics]);

  const getSummary = useCallback(() => {
    if (analytics.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        totalEscrow: 0,
        totalRefunds: 0,
        totalTransactions: 0,
        averageTransaction: 0,
      };
    }

    const latest = analytics[0];
    return {
      totalRevenue: latest.total_revenue,
      totalExpenses: latest.total_expenses,
      totalEscrow: latest.total_escrow,
      totalRefunds: latest.total_refunds,
      totalTransactions: latest.transaction_count,
      averageTransaction: latest.average_transaction,
    };
  }, [analytics]);

  return {
    analytics,
    reports,
    loading,
    summary: getSummary(),
    comparison: getMonthlyComparison(),
    generateReport,
    refetch: () => {
      fetchAnalytics();
      fetchReports();
    },
  };
};
