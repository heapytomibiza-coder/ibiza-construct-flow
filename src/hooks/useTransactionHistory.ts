import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  stripe_transaction_id?: string;
}

export function useTransactionHistory(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const fetchTransactions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data || []).map((t: any) => ({
        ...t,
        transaction_type: t.transaction_type || 'payment',
        stripe_transaction_id: t.stripe_payment_intent_id || t.stripe_charge_id,
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesType = filters.type === 'all' || transaction.transaction_type === filters.type;
      const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
      const matchesSearch = !filters.search || 
        transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.transaction_type.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [transactions, filters]);

  const exportTransactions = async () => {
    try {
      const csv = [
        ['Date', 'Type', 'Amount', 'Status', 'Payment Method', 'Description'].join(','),
        ...filteredTransactions.map(t => 
          [
            new Date(t.created_at).toLocaleDateString(),
            t.transaction_type,
            `${t.currency} ${t.amount}`,
            t.status,
            t.payment_method || 'N/A',
            t.description || ''
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Transactions exported successfully',
      });
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to export transactions',
        variant: 'destructive',
      });
    }
  };

  const getTransactionById = (id: string) => {
    return transactions.find(t => t.id === id);
  };

  return {
    transactions: filteredTransactions,
    loading,
    filters,
    filter: filters,
    setFilters,
    setFilter: setFilters,
    fetchTransactions,
    exportTransactions,
    getTransactionById,
  };
}
