import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCount = (userId?: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase.rpc('get_unread_message_count', {
        p_user_id: userId
      });

      if (!error && data !== null) {
        setUnreadCount(data);
      }
      setLoading(false);
    };

    fetchUnreadCount();

    // Subscribe to message changes
    const channel = supabase
      .channel('unread-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadCount, loading };
};
