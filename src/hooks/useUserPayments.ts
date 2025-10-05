import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentHistoryItem {
  id: string;
  user_id: string;
  job_id: string | null;
  invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  payment_method_id: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface EarningsSummary {
  total_earnings: number;
  pending_earnings: number;
  total_transactions: number;
  completed_transactions: number;
  average_transaction: number;
  last_payment_date: string | null;
}

export function useUserPayments() {
  const queryClient = useQueryClient();

  // Fetch user's payment history
  const { data: paymentHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      return data as unknown as PaymentHistoryItem[];
    },
  });

  // Fetch earnings summary (for professionals)
  const { data: earningsSummary, isLoading: loadingEarnings } = useQuery({
    queryKey: ['earnings-summary'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_professional_earnings_summary', {
        p_professional_id: user.id,
      });
      
      if (error) throw error;
      return data as unknown as EarningsSummary;
    },
  });

  // Fetch payment receipts
  const { data: receipts, isLoading: loadingReceipts } = useQuery({
    queryKey: ['payment-receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('issued_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Request refund
  const requestRefund = useMutation({
    mutationFn: async ({ 
      paymentId, 
      amount, 
      reason 
    }: { 
      paymentId: string; 
      amount: number; 
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          payment_id: paymentId,
          requested_by: user.id,
          amount,
          reason,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      toast.success('Refund request submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit refund request');
      console.error('Refund request error:', error);
    },
  });

  // Generate receipt
  const generateReceipt = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase.rpc('generate_payment_receipt', {
        p_payment_id: paymentId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-receipts'] });
      toast.success('Receipt generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate receipt');
    },
  });

  return {
    paymentHistory,
    loadingHistory,
    earningsSummary,
    loadingEarnings,
    receipts,
    loadingReceipts,
    requestRefund,
    generateReceipt,
  };
}
