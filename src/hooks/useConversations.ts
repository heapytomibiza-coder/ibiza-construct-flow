import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  job_id: string | null;
  participants: string[];
  last_message_at: string;
  metadata: any;
  unread_count?: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

export const useConversations = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [userId])
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
        return;
      }

      // Fetch unread counts and last messages for each conversation
      const conversationsWithData = await Promise.all(
        (data || []).map(async (conv) => {
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

      setConversations(conversationsWithData);
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participants.cs.{${userId}}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const createConversation = useCallback(async (
    participantIds: string[],
    jobId?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const participants = [user.id, ...participantIds];

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participants,
        job_id: jobId || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  const getOrCreateConversation = useCallback(async (
    participantId: string,
    jobId?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .contains('participants', [user.id, participantId])
      .eq('job_id', jobId || null)
      .single();

    if (existing) return existing;

    // Create new conversation
    return createConversation([participantId], jobId);
  }, [createConversation]);

  return {
    conversations,
    loading,
    createConversation,
    getOrCreateConversation,
    totalUnread: conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
  };
};
