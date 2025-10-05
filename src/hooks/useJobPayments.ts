import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useJobPayments(jobId?: string) {
  const queryClient = useQueryClient();

  // Fetch payments for a specific job
  const { data: jobPayments, isLoading: loadingPayments } = useQuery({
    queryKey: ['job-payments', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  // Create payment for job
  const createJobPayment = useMutation({
    mutationFn: async ({
      jobId,
      amount,
      currency = 'USD',
      paymentMethodId,
    }: {
      jobId: string;
      amount: number;
      currency?: string;
      paymentMethodId?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_job_payment' as any, {
        p_job_id: jobId,
        p_amount: amount,
        p_currency: currency,
        p_payment_method_id: paymentMethodId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-payments', jobId] });
      toast.success('Payment initiated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create payment');
    },
  });

  // Release escrow for job
  const releaseEscrow = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc('release_escrow_for_job' as any, {
        p_job_id: jobId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-payments', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Escrow released successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to release escrow');
    },
  });

  // Generate invoice for job
  const generateInvoice = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc('generate_job_invoice' as any, {
        p_job_id: jobId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate invoice');
    },
  });

  return {
    jobPayments,
    loadingPayments,
    createJobPayment,
    releaseEscrow,
    generateInvoice,
  };
}
