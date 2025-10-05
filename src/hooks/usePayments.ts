import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Payment {
  id: string;
  job_id: string | null;
  client_id: string;
  professional_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  platform_fee: number;
  net_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

export const usePayments = (userId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
      } else {
        setPayments((data as any) || []);
      }
      setLoading(false);
    };

    fetchPayments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const createPaymentIntent = useCallback(async (
    jobId: string,
    amount: number,
    currency: string = 'USD'
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { jobId, amount, currency }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to create payment');
      throw error;
    }
  }, []);

  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { paymentIntentId }
      });

      if (error) throw error;
      
      toast.success('Payment confirmed successfully');
      return data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
      throw error;
    }
  }, []);

  const processPayment = useCallback(async (
    jobId: string,
    amount: number,
    paymentMethodId: string
  ) => {
    try {
      // Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent(jobId, amount);

      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Confirm payment
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (stripeError) throw stripeError;

      // Confirm on our backend
      await confirmPayment(paymentIntentId);

      return { success: true };
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Payment failed');
      throw error;
    }
  }, [createPaymentIntent, confirmPayment]);

  const requestRefund = useCallback(async (paymentId: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const payment = payments.find(p => p.id === paymentId);
      if (!payment) throw new Error('Payment not found');

      const { error } = await supabase
        .from('refunds')
        .insert({
          payment_id: paymentId,
          amount: payment.amount,
          reason,
          status: 'pending',
          requested_by: user.id
        });

      if (error) throw error;

      toast.success('Refund request submitted');
    } catch (error: any) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to request refund');
      throw error;
    }
  }, [payments]);

  return {
    payments,
    loading,
    createPaymentIntent,
    confirmPayment,
    processPayment,
    requestRefund,
    stats: {
      total: payments.reduce((sum, p) => sum + (p.status === 'succeeded' ? p.amount : 0), 0),
      count: payments.filter(p => p.status === 'succeeded').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length
    }
  };
};
