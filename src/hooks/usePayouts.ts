import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Payout {
  id: string;
  professional_id: string;
  stripe_payout_id: string | null;
  amount: number;
  currency: string;
  status: string;
  arrival_date: string | null;
  method: string | null;
  created_at: string;
}

interface PayoutItem {
  id: string;
  payout_id: string;
  payment_id: string;
  amount: number;
}

export const usePayouts = (professionalId?: string) => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchPayouts = async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payouts:', error);
      } else {
        setPayouts((data as any) || []);
      }
      setLoading(false);
    };

    fetchPayouts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('payouts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payouts',
          filter: `professional_id=eq.${professionalId}`
        },
        () => {
          fetchPayouts();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [professionalId]);

  const getPayoutDetails = useCallback(async (payoutId: string) => {
    const { data, error } = await supabase
      .from('payout_items')
      .select(`
        *,
        payment:payments!payment_id (
          id,
          job_id,
          amount,
          created_at
        )
      `)
      .eq('payout_id', payoutId);

    if (error) {
      console.error('Error fetching payout details:', error);
      return [];
    }

    return data;
  }, []);

  const requestPayout = useCallback(async () => {
    if (!professionalId) return;

    try {
      // Check if there's already a pending payout
      const { data: existing } = await supabase
        .from('payouts')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('status', 'pending')
        .single();

      if (existing) {
        throw new Error('You already have a pending payout');
      }

      // Get available balance from released escrow
      const { data: released } = await supabase
        .from('escrow_releases')
        .select('amount')
        .eq('status', 'released');

      if (!released || released.length === 0) {
        throw new Error('No funds available for payout');
      }

      const totalAmount = released.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

      // Create payout request
      const { error } = await supabase
        .from('payouts')
        .insert({
          professional_id: professionalId,
          amount: totalAmount,
          currency: 'USD',
          status: 'pending'
        });

      if (error) throw error;

      return { success: true, amount: totalAmount };
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  }, [professionalId]);

  const getEarnings = useCallback(() => {
    const totalEarnings = payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingEarnings = payouts
      .filter(p => p.status === 'pending' || p.status === 'in_transit')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalEarnings,
      pendingEarnings,
      availableForPayout: pendingEarnings,
      payoutHistory: payouts
    };
  }, [payouts]);

  return {
    payouts,
    loading,
    getPayoutDetails,
    requestPayout,
    earnings: getEarnings(),
    stats: {
      total: payouts.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0),
      pending: payouts.filter(p => p.status === 'pending').length,
      inTransit: payouts.filter(p => p.status === 'in_transit').length,
      paid: payouts.filter(p => p.status === 'paid').length
    }
  };
};
