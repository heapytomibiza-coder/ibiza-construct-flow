import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RefundRequest {
  id: string;
  payment_id: string;
  amount: number;
  reason: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export function useRefunds(userId?: string) {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchRefunds();
    }
  }, [userId]);

  const fetchRefunds = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load refund requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (paymentId: string, amount: number, reason: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('refund_requests')
        .insert({
          payment_id: paymentId,
          requested_by: user.data.user.id,
          amount,
          reason,
        });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Refund request submitted',
      });
      
      await fetchRefunds();
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit refund request',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelRefundRequest = async (refundId: string) => {
    try {
      const { error } = await supabase
        .from('refund_requests')
        .update({ status: 'cancelled' })
        .eq('id', refundId)
        .eq('status', 'pending');

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Refund request cancelled',
      });
      
      await fetchRefunds();
    } catch (error) {
      console.error('Error cancelling refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel refund request',
        variant: 'destructive',
      });
    }
  };

  return {
    refunds,
    loading,
    fetchRefunds,
    requestRefund,
    cancelRefundRequest,
  };
}
