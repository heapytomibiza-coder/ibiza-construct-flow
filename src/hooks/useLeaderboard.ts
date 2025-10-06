import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  rank: number;
  score: number;
  user?: {
    full_name: string | null;
    display_name: string | null;
  };
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string | null;
  leaderboard_type: string;
  period: string;
}

export function useLeaderboard(leaderboardId?: string, period: string = 'monthly') {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);

      // Fetch all leaderboards
      const { data: leaderboardsData, error: leaderboardsError } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (leaderboardsError) throw leaderboardsError;

      setLeaderboards(leaderboardsData || []);

      // If a specific leaderboard is selected, fetch its entries
      if (leaderboardId || leaderboardsData?.[0]?.id) {
        await fetchLeaderboardEntries(leaderboardId || leaderboardsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardEntries = async (boardId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch top entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          user:profiles!leaderboard_entries_user_id_fkey(full_name, display_name)
        `)
        .eq('leaderboard_id', boardId)
        .order('rank', { ascending: true })
        .limit(100);

      if (entriesError) throw entriesError;

      setEntries(entriesData as any || []);

      // Find user's rank if logged in
      if (user) {
        const userEntry = entriesData?.find(e => e.user_id === user.id);
        setUserRank(userEntry as any || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard entries:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, [period]);

  return {
    leaderboards,
    entries,
    userRank,
    loading,
    fetchLeaderboardEntries,
    refetch: fetchLeaderboards,
  };
}
