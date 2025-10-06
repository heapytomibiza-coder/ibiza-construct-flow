import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

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

export const useMessaging = (userId?: string, conversationId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch conversations
  const conversationsQuery = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      // Filter conversations where user is a participant
      return (data || []).filter((conv: any) => 
        conv.participants && Array.isArray(conv.participants) && conv.participants.includes(userId)
      );
    },
    enabled: !!userId,
  });

  // Fetch messages for conversation
  const messagesQuery = useQuery<any[]>({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<any[]> => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });

  // Fetch unread count
  const unreadCountQuery = useQuery<number>({
    queryKey: ['unread-count', userId],
    queryFn: async (): Promise<number> => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .is('read_at', null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

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
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
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
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

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
  const createConversation = useMutation({
    mutationFn: async ({ recipientId, subject, jobId, initialMessage }: CreateConversationParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id, participants')
        .eq('is_archived', false);

      const existing = existingConvs?.find((conv: any) =>
        conv.participants &&
        Array.isArray(conv.participants) &&
        conv.participants.length === 2 &&
        conv.participants.includes(user.id) &&
        conv.participants.includes(recipientId)
      );

      let conversationId = existing?.id;

      if (!conversationId) {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            participants: [user.id, recipientId],
            subject,
            job_id: jobId,
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // Send initial message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: initialMessage,
        });

      if (msgError) throw msgError;

      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Conversation Started',
        description: 'Your message has been sent.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Start Conversation',
        description: error.message,
      });
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, recipientId, content, attachments, parentMessageId }: SendMessageParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Message',
        description: error.message,
      });
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  // Update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!conversationId || !userId) return;

    await supabase
      .from('typing_indicators' as any)
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      });
  };

  // Add reaction
  const addReaction = useMutation({
    mutationFn: async ({ messageId, reaction }: { messageId: string; reaction: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('message_reactions' as any)
        .upsert({
          message_id: messageId,
          user_id: user.id,
          reaction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Delete message
  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: 'Message Deleted',
        description: 'The message has been removed.',
      });
    },
  });

  return {
    conversations: conversationsQuery.data || [],
    messages: messagesQuery.data || [],
    unreadCount: unreadCountQuery.data || 0,
    typingUsers,
    conversationsLoading: conversationsQuery.isLoading,
    messagesLoading: messagesQuery.isLoading,
    createConversation,
    sendMessage,
    markAsRead,
    updateTypingStatus,
    addReaction,
    deleteMessage,
  };
};
