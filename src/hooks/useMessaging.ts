import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendMessageParams {
  conversationId: string;
  recipientId: string;
  content: string;
  attachments?: any[];
  parentMessageId?: string;
}

interface CreateConversationParams {
  recipientId: string;
  subject?: string;
  jobId?: string;
  initialMessage: string;
}

// Helper function outside component to avoid type inference issues
async function fetchExistingConversations(): Promise<{ data: any[] | null; error: any }> {
  const client: any = supabase;
  const result = await client.from('conversations').select('id, participants').eq('is_archived', false);
  return { data: result.data, error: result.error };
}

export const useMessaging = (userId?: string, conversationId?: string) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    if (!userId) {
      setConversationsLoading(false);
      return;
    }

    const fetchConversations = async () => {
      const client: any = supabase;
      const { data: convData, error: convError } = await client
        .from('conversations')
        .select('*')
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);
        setConversationsLoading(false);
        return;
      }

      // Filter conversations where user is a participant
      const filtered = (convData || []).filter((conv: any) => 
        conv.participants && Array.isArray(conv.participants) && conv.participants.includes(userId)
      );
      
      setConversations(filtered);
      setConversationsLoading(false);
    };

    fetchConversations();

    // Subscribe to real-time conversation updates
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fetch messages for conversation
  useEffect(() => {
    if (!conversationId) {
      setMessagesLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const client: any = supabase;
      const { data, error } = await client
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessagesLoading(false);
        return;
      }

      setMessages(data || []);
      setMessagesLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Fetch unread count
  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      const client: any = supabase;
      const { count, error } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .is('read_at', null);

      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Subscribe to new messages
    const channel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const indicator = payload.new as any;
            if (indicator.is_typing && indicator.user_id !== userId) {
              setTypingUsers((prev) => new Set(prev).add(indicator.user_id));
            } else {
              setTypingUsers((prev) => {
                const next = new Set(prev);
                next.delete(indicator.user_id);
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  // Create conversation
  const createConversation = useCallback(async ({ recipientId, subject, jobId, initialMessage }: CreateConversationParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists
      const convQuery = await fetchExistingConversations();
      const existingConvs = convQuery.data || [];
      const existing = existingConvs.find((conv: any) =>
        conv.participants &&
        Array.isArray(conv.participants) &&
        conv.participants.length === 2 &&
        conv.participants.includes(user.id) &&
        conv.participants.includes(recipientId)
      );

      let convId = existing?.id;

      if (!convId) {
        // Create new conversation
        const client: any = supabase;
        const { data: newConversation, error: convError } = await client
          .from('conversations')
          .insert({
            participants: [user.id, recipientId],
            subject,
            job_id: jobId,
          })
          .select()
          .single();

        if (convError) throw convError;
        convId = newConversation.id;
      }

      // Send initial message
      const msgClient: any = supabase;
      const { error: msgError } = await msgClient
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: initialMessage,
        });

      if (msgError) throw msgError;

      toast({
        title: 'Conversation Started',
        description: 'Your message has been sent.',
      });

      return convId;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Start Conversation',
        description: error.message,
      });
      throw error;
    }
  }, [toast]);

  // Send message
  const sendMessage = useCallback(async ({ conversationId, recipientId, content, attachments, parentMessageId }: SendMessageParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const client: any = supabase;
      const { data, error } = await client
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          attachments: attachments || [],
          parent_message_id: parentMessageId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Message',
        description: error.message,
      });
      throw error;
    }
  }, [toast]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const client: any = supabase;
      const { error } = await client
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  }, []);

  // Update typing status
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !userId) return;

    const client: any = supabase;
    await client
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      });
  }, [conversationId, userId]);

  // Add reaction
  const addReaction = useCallback(async ({ messageId, reaction }: { messageId: string; reaction: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const client: any = supabase;
      const { data, error } = await client
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          reaction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error adding reaction:', error);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const client: any = supabase;
      const { error } = await client
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Message Deleted',
        description: 'The message has been removed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Delete Message',
        description: error.message,
      });
    }
  }, [toast]);

  return {
    conversations,
    messages,
    unreadCount,
    typingUsers,
    conversationsLoading,
    messagesLoading,
    createConversation,
    sendMessage,
    markAsRead,
    updateTypingStatus,
    addReaction,
    deleteMessage,
  };
};
