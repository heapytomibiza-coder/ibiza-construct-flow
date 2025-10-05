import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PayoutAccount {
  id: string;
  professional_id: string;
  stripe_account_id: string;
  account_type: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  country?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalPayout {
  id: string;
  professional_id: string;
  payout_account_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  stripe_payout_id?: string;
  stripe_transfer_id?: string;
  requested_at: string;
  processed_at?: string;
  paid_at?: string;
  failed_reason?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalEarning {
  id: string;
  professional_id: string;
  source_type: 'job' | 'contract' | 'milestone' | 'invoice' | 'booking';
  source_id: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  status: 'pending' | 'available' | 'paid' | 'held' | 'refunded';
  earned_at: string;
  available_at?: string;
  payout_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const usePayouts = (userId?: string) => {
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccount | null>(null);
  const [payouts, setPayouts] = useState<ProfessionalPayout[]>([]);
  const [earnings, setEarnings] = useState<ProfessionalEarning[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayoutAccount = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payout_accounts')
        .select('*')
        .eq('professional_id', userId)
        .maybeSingle();

      if (error) throw error;
      setPayoutAccount(data as any);
    } catch (error) {
      console.error('Error fetching payout account:', error);
      toast.error('Failed to load payout account');
    }
  }, [userId]);

  const fetchPayouts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('professional_payouts')
        .select('*')
        .eq('professional_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts((data as any) || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchEarnings = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('professional_earnings')
        .select('*')
        .eq('professional_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setEarnings((data as any) || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPayoutAccount();
      fetchPayouts();
      fetchEarnings();
    }

    // Set up real-time subscriptions
    const payoutAccountChannel = supabase
      .channel('payout-account-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payout_accounts',
          filter: `professional_id=eq.${userId}`
        },
        () => {
          fetchPayoutAccount();
        }
      )
      .subscribe();

    const payoutsChannel = supabase
      .channel('payouts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_payouts',
          filter: `professional_id=eq.${userId}`
        },
        () => {
          fetchPayouts();
        }
      )
      .subscribe();

    const earningsChannel = supabase
      .channel('earnings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_earnings',
          filter: `professional_id=eq.${userId}`
        },
        () => {
          fetchEarnings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(payoutAccountChannel);
      supabase.removeChannel(payoutsChannel);
      supabase.removeChannel(earningsChannel);
    };
  }, [userId, fetchPayoutAccount, fetchPayouts, fetchEarnings]);

  const createConnectAccount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: {},
      });

      if (error) throw error;

      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, '_blank');
        toast.success('Stripe account created! Complete onboarding in the new tab.');
      } else if (data.status === 'existing') {
        toast.info('You already have a payout account set up.');
      }

      return data;
    } catch (error) {
      console.error('Error creating connect account:', error);
      toast.error('Failed to create payout account');
      throw error;
    }
  };

  const requestPayout = async (amount: number, currency = 'USD') => {
    try {
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: { amount, currency },
      });

      if (error) throw error;

      toast.success('Payout requested successfully!');
      fetchPayouts();
      fetchEarnings();
      return data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Failed to request payout');
      throw error;
    }
  };

  const stats = {
    totalEarnings: earnings.reduce((sum, e) => sum + Number(e.amount), 0),
    availableBalance: earnings
      .filter(e => e.status === 'available')
      .reduce((sum, e) => sum + Number(e.net_amount), 0),
    pendingEarnings: earnings
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + Number(e.net_amount), 0),
    paidOut: payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0),
  };

  return {
    payoutAccount,
    payouts,
    earnings,
    loading,
    stats,
    createConnectAccount,
    requestPayout,
    refetch: () => {
      fetchPayoutAccount();
      fetchPayouts();
      fetchEarnings();
    },
  };
};
