import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationWithDetails {
  id: string;
  participants: string[];
  job_id: string | null;
  last_message_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

export const useConversationList = (userId?: string) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      // Fetch conversations where user is a participant
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [userId])
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);
        setLoading(false);
        return;
      }

      // Fetch unread counts and last messages for each conversation
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            unread_count: count || 0,
            last_message: lastMsg || undefined
          };
        })
      );

      setConversations(conversationsWithDetails);
      setTotalUnread(conversationsWithDetails.reduce((sum, c) => sum + (c.unread_count || 0), 0));
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to conversation updates
    const channel = supabase
      .channel('user-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createConversation = useCallback(async (
    participantIds: string[],
    jobId?: string
  ) => {
    if (!userId || !participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participants: participantIds,
        job_id: jobId || null,
        metadata: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [userId]);

  return {
    conversations,
    loading,
    totalUnread,
    createConversation
  };
};
