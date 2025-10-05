import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaymentMethods = (userId?: string) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentMethods = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPaymentMethods();

    if (!userId) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel('payment-methods')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_methods',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchPaymentMethods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchPaymentMethods]);

  const setDefaultMethod = async (methodId: string) => {
    if (!userId) return;

    try {
      // Remove default from all methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Set new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Default payment method updated');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const deleteMethod = async (methodId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Payment method removed');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to remove payment method');
    }
  };

  return {
    paymentMethods,
    loading,
    setDefaultMethod,
    deleteMethod,
    refetch: fetchPaymentMethods
  };
};
