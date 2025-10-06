import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: string;
  custom_status?: string;
  status_emoji?: string;
  device_info?: any;
  updated_at: string;
}

export const usePresence = (userIds?: string[]) => {
  const { user } = useAuth();
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Mark user as online when component mounts
    markOnline();

    // Set up heartbeat to keep presence updated
    const heartbeatInterval = setInterval(() => {
      markOnline();
    }, 30000); // Update every 30 seconds

    // Set up beforeunload to mark offline
    const handleBeforeUnload = () => {
      markOffline();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      markOffline();
    };
  }, [user]);

  useEffect(() => {
    fetchPresences();

    // Subscribe to presence changes
    const channel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const presence = payload.new as UserPresence;
            setPresences(prev => ({
              ...prev,
              [presence.user_id]: presence
            }));
          } else if (payload.eventType === 'DELETE') {
            const presence = payload.old as UserPresence;
            setPresences(prev => {
              const newPresences = { ...prev };
              delete newPresences[presence.user_id];
              return newPresences;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds]);

  const fetchPresences = async () => {
    try {
      let query = (supabase as any).from('user_presence').select('*');
      
      if (userIds && userIds.length > 0) {
        query = query.in('user_id', userIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const presenceMap: Record<string, UserPresence> = {};
      (data || []).forEach((p: UserPresence) => {
        presenceMap[p.user_id] = p;
      });
      setPresences(presenceMap);

      // Get online count
      const { data: countData } = await (supabase as any).rpc('get_online_users_count');
      setOnlineCount(countData || 0);
    } catch (error) {
      console.error('Error fetching presences:', error);
    }
  };

  const markOnline = async () => {
    if (!user) return;

    try {
      await (supabase as any).rpc('mark_user_online', {
        p_user_id: user.id,
        p_device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });
    } catch (error) {
      console.error('Error marking online:', error);
    }
  };

  const markOffline = async () => {
    if (!user) return;

    try {
      await (supabase as any)
        .from('user_presence')
        .update({ status: 'offline', last_seen: new Date().toISOString() })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking offline:', error);
    }
  };

  const updateStatus = async (
    status: 'online' | 'away' | 'busy',
    customStatus?: string,
    statusEmoji?: string
  ) => {
    if (!user) return;

    try {
      await (supabase as any)
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          custom_status: customStatus,
          status_emoji: statusEmoji,
          last_seen: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getUserPresence = (userId: string): UserPresence | null => {
    return presences[userId] || null;
  };

  const isUserOnline = (userId: string): boolean => {
    const presence = presences[userId];
    if (!presence) return false;

    const lastSeen = new Date(presence.last_seen);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return presence.status === 'online' && lastSeen > fiveMinutesAgo;
  };

  return {
    presences,
    onlineCount,
    updateStatus,
    getUserPresence,
    isUserOnline,
    refresh: fetchPresences
  };
};

