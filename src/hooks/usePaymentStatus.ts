/**
 * Payment Status Hook
 * Fetches unified payment and escrow status for jobs/contracts
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStatus {
  status: string | null;
  escrow_status: string | null;
  amount: number | null;
  currency: string | null;
}

export function usePaymentStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['payment-status', jobId],
    queryFn: async () => {
      if (!jobId) return null;

      // Fetch latest payment transaction
      const { data: payment } = await supabase
        .from('payment_transactions')
        .select('status, amount, currency')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch contract escrow status
      const { data: contract } = await supabase
        .from('contracts')
        .select('escrow_status')
        .eq('job_id', jobId)
        .single();

      return {
        status: payment?.status ?? null,
        escrow_status: contract?.escrow_status ?? null,
        amount: payment?.amount ?? null,
        currency: payment?.currency ?? null,
      } as PaymentStatus;
    },
    enabled: !!jobId,
  });
}
