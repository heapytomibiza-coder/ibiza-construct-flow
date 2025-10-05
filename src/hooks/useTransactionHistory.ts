import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  payment_id?: string;
  transaction_type: 'payment' | 'refund' | 'payout' | 'fee' | 'adjustment';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  stripe_transaction_id?: string;
  description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TransactionNote {
  id: string;
  transaction_id: string;
  user_id: string;
  note: string;
  is_internal: boolean;
  created_at: string;
}

export const useTransactionHistory = (userId?: string) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      let query = (supabase as any)
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter.type) {
        query = query.eq('transaction_type', filter.type);
      }
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom);
      }
      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }

    // Real-time subscription
    const channel = (supabase as any)
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchTransactions]);

  const getTransactionById = async (transactionId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to load transaction details');
      return null;
    }
  };

  const addTransactionNote = async (transactionId: string, note: string) => {
    if (!userId) return;

    try {
      const { error } = await (supabase as any)
        .from('transaction_notes')
        .insert({
          transaction_id: transactionId,
          user_id: userId,
          note,
          is_internal: false
        });

      if (error) throw error;
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const getTransactionNotes = async (transactionId: string): Promise<TransactionNote[]> => {
    try {
      const { data, error } = await (supabase as any)
        .from('transaction_notes')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  };

  const exportTransactions = async () => {
    try {
      // Convert transactions to CSV
      const headers = ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Description'];
      const csvRows = [
        headers.join(','),
        ...transactions.map(t => [
          new Date(t.created_at).toLocaleDateString(),
          t.transaction_type,
          t.amount,
          t.currency,
          t.status,
          t.description || ''
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Transaction history exported');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  return {
    transactions,
    loading,
    filter,
    setFilter,
    refetch: fetchTransactions,
    getTransactionById,
    addTransactionNote,
    getTransactionNotes,
    exportTransactions
  };
};
