import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RefundRequest {
  id: string;
  payment_id: string;
  requested_by: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  processed_at?: string;
  stripe_refund_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useRefunds = (userId?: string) => {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('refund_requests')
        .select('*')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRefunds();
    }

    // Real-time subscription
    const channel = (supabase as any)
      .channel('refund-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'refund_requests',
          filter: `requested_by=eq.${userId}`
        },
        () => {
          fetchRefunds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchRefunds]);

  const requestRefund = async (paymentId: string, amount: number, reason: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('refund_requests')
        .insert({
          payment_id: paymentId,
          requested_by: userId,
          amount,
          reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Refund request submitted successfully');
      fetchRefunds();
      return data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to submit refund request');
      return null;
    }
  };

  const cancelRefundRequest = async (refundId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('refund_requests')
        .update({ status: 'cancelled' })
        .eq('id', refundId)
        .eq('requested_by', userId);

      if (error) throw error;
      toast.success('Refund request cancelled');
      fetchRefunds();
    } catch (error) {
      console.error('Error cancelling refund:', error);
      toast.error('Failed to cancel refund request');
    }
  };

  return {
    refunds,
    loading,
    requestRefund,
    cancelRefundRequest,
    refetch: fetchRefunds
  };
};
