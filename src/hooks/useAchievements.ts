import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  points_reward: number;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  completed_at: string | null;
  claimed_at: string | null;
  achievement: Achievement;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's achievements with progress
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Fetch all available achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points_reward', { ascending: false });

      if (achievementsError) throw achievementsError;

      setAchievements(userAchievements as any || []);
      setAvailableAchievements(allAchievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (achievementId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find the user achievement
      const userAchievement = achievements.find(
        a => a.achievement_id === achievementId && a.completed_at && !a.claimed_at
      );

      if (!userAchievement) {
        throw new Error('Achievement not completed or already claimed');
      }

      // Mark as claimed
      const { error } = await supabase
        .from('user_achievements')
        .update({ claimed_at: new Date().toISOString() })
        .eq('id', userAchievement.id);

      if (error) throw error;

      // Award points
      const { error: pointsError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          points: userAchievement.achievement.points_reward,
          transaction_type: 'earn',
          source: 'achievement',
          source_id: achievementId,
          description: `Claimed achievement: ${userAchievement.achievement.name}`,
        });

      if (pointsError) throw pointsError;

      toast({
        title: 'Achievement Claimed!',
        description: `You earned ${userAchievement.achievement.points_reward} points!`,
      });

      await fetchAchievements();
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim achievement',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    availableAchievements,
    loading,
    claimAchievement,
    refetch: fetchAchievements,
  };
}
