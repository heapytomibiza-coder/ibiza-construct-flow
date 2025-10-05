import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  user_id: string;
  actor_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  description: string | null;
  action_url: string | null;
  metadata: any;
  read_at: string | null;
  created_at: string;
  actor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useActivityFeed = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          actor:profiles!actor_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data || []);
      }
      setLoading(false);
    };

    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`activity-feed:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const markAsRead = useCallback(async (activityId: string) => {
    const { error } = await supabase
      .from('activity_feed')
      .update({ read_at: new Date().toISOString() })
      .eq('id', activityId);

    if (error) {
      console.error('Error marking activity as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('activity_feed')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('Error marking all activities as read:', error);
    }
  }, [userId]);

  return {
    activities,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount: activities.filter(a => !a.read_at).length
  };
};
