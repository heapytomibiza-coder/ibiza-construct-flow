import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LoyaltyTier {
  id: string;
  name: string;
  level: number;
  points_required: number;
  perks: string[];
  color: string | null;
  icon: string | null;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  current_balance: number;
  tier_id: string | null;
  tier: LoyaltyTier | null;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  source: string;
  description: string | null;
  created_at: string;
}

export function useLoyaltyPoints() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user points with tier info
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select(`
          *,
          tier:loyalty_tiers(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;

      // Fetch all tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('level', { ascending: true });

      if (tiersError) throw tiersError;

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;

      setUserPoints(pointsData as any);
      setAllTiers((tiersData || []).map(tier => ({
        ...tier,
        perks: Array.isArray(tier.perks) ? tier.perks as string[] : JSON.parse(tier.perks as string),
      })) as LoyaltyTier[]);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching points data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load loyalty points',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextTier = () => {
    if (!userPoints || !allTiers.length) return null;
    
    const currentLevel = userPoints.tier?.level || 0;
    return allTiers.find(tier => tier.level > currentLevel);
  };

  const getProgressToNextTier = () => {
    if (!userPoints) return 0;
    
    const nextTier = getNextTier();
    if (!nextTier) return 100;

    const currentPoints = userPoints.total_points;
    const currentTierPoints = userPoints.tier?.points_required || 0;
    const nextTierPoints = nextTier.points_required;

    const progress = ((currentPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  useEffect(() => {
    fetchPointsData();

    // Set up realtime subscription for points updates
    const channel = supabase
      .channel('points_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'points_transactions',
          filter: `user_id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`,
        },
        () => {
          fetchPointsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    userPoints,
    transactions,
    allTiers,
    loading,
    getNextTier,
    getProgressToNextTier,
    refetch: fetchPointsData,
  };
}
