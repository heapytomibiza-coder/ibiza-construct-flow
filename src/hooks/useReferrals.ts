import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referrer_reward_points: number | null;
  referred_reward_points: number | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  referred_user?: {
    full_name: string | null;
  };
}

export function useReferrals() {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalPointsEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (codeError && codeError.code !== 'PGRST116') {
        // No code exists, create one
        await createReferralCode();
        return;
      }

      // Fetch referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:profiles!referrals_referred_id_fkey(full_name)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      setReferralCode(codeData);
      setReferrals(referralsData as any || []);

      // Calculate stats
      const completed = referralsData?.filter(r => r.status === 'completed').length || 0;
      const pending = referralsData?.filter(r => r.status === 'pending').length || 0;
      const totalPoints = referralsData?.reduce((sum, r) => sum + (r.referrer_reward_points || 0), 0) || 0;

      setStats({
        totalReferrals: referralsData?.length || 0,
        completedReferrals: completed,
        pendingReferrals: pending,
        totalPointsEarned: totalPoints,
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate unique code
      const code = `REF${user.id.slice(0, 8).toUpperCase()}`;

      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setReferralCode(data);
      toast({
        title: 'Referral Code Created',
        description: `Your referral code: ${code}`,
      });
    } catch (error) {
      console.error('Error creating referral code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create referral code',
        variant: 'destructive',
      });
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) return;

    const link = `${window.location.origin}?ref=${referralCode.code}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: 'Link Copied',
      description: 'Referral link copied to clipboard',
    });
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  return {
    referralCode,
    referrals,
    stats,
    loading,
    createReferralCode,
    copyReferralLink,
    refetch: fetchReferralData,
  };
}
