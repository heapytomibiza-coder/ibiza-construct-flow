import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  job_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  transaction_id?: string;
  stripe_transaction_id?: string;
}

export function usePayments(userId?: string) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
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
        description: 'Failed to load payment history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (amount: number, jobId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount, 
          type: 'payment',
          job_id: jobId 
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate payment',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const generateReceipt = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_payment_receipt', {
        p_payment_id: paymentId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate receipt',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    createPaymentIntent,
    generateReceipt,
  };
}
