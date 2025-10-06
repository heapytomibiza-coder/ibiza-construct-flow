import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TypingUser {
  user_id: string;
  started_at: string;
}

export const useTypingIndicator = (conversationId?: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser>>({});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    fetchTypingUsers();

    // Subscribe to typing indicator changes
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const typing = payload.new as any;
            if (typing.user_id !== user?.id) {
              setTypingUsers(prev => ({
                ...prev,
                [typing.user_id]: {
                  user_id: typing.user_id,
                  started_at: typing.started_at
                }
              }));
            }
          } else if (payload.eventType === 'DELETE') {
            const typing = payload.old as any;
            setTypingUsers(prev => {
              const newTyping = { ...prev };
              delete newTyping[typing.user_id];
              return newTyping;
            });
          }
        }
      )
      .subscribe();

    // Cleanup expired indicators periodically
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      setTypingUsers(prev => {
        const filtered: Record<string, TypingUser> = {};
        Object.entries(prev).forEach(([userId, typing]) => {
          const expiresAt = new Date(new Date(typing.started_at).getTime() + 10000);
          if (expiresAt > now) {
            filtered[userId] = typing;
          }
        });
        return filtered;
      });
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [conversationId, user]);

  const fetchTypingUsers = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('typing_indicators')
        .select('user_id, started_at')
        .eq('conversation_id', conversationId)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const typingMap: Record<string, TypingUser> = {};
      (data || []).forEach((t: any) => {
        if (t.user_id !== user?.id) {
          typingMap[t.user_id] = t;
        }
      });
      setTypingUsers(typingMap);
    } catch (error) {
      console.error('Error fetching typing users:', error);
    }
  };

  const startTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      // Clear existing timeout
      if (typingTimeout) clearTimeout(typingTimeout);

      // Insert or update typing indicator
      await (supabase as any)
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10000).toISOString()
        });

      // Set timeout to stop typing after 10 seconds
      const timeout = setTimeout(() => {
        stopTyping();
      }, 10000);
      setTypingTimeout(timeout);
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  }, [conversationId, user, typingTimeout]);

  const stopTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }

      await (supabase as any)
        .from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  }, [conversationId, user, typingTimeout]);

  const getTypingUserIds = (): string[] => {
    return Object.keys(typingUsers);
  };

  return {
    typingUsers: Object.values(typingUsers),
    startTyping,
    stopTyping,
    getTypingUserIds,
    isAnyoneTyping: Object.keys(typingUsers).length > 0
  };
};
