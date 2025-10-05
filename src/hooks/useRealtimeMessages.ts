import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  conversation_id: string | null;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachments: any;
  thread_id: string | null;
  is_edited: boolean | null;
  read_at: string | null;
  created_at: string;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export const useRealtimeMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [conversationId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const messageChannel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = messageChannel.presenceState();
        const typing = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.isTyping) {
              typing.add(presence.userId);
            }
          });
        });
        setTypingUsers(typing);
      })
      .subscribe();

    setChannel(messageChannel);

    return () => {
      messageChannel.unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string, attachments: any[] = []) => {
    if (!conversationId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get the first participant that's not the current user for recipient_id
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    const recipientId = conversation?.participants.find((p: string) => p !== user.id);

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      recipient_id: recipientId || user.id,
      content,
      attachments: attachments as any
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId]);

  const markAsRead = useCallback(async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!channel) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await channel.track({
      userId: user.id,
      conversationId,
      isTyping
    });
  }, [channel, conversationId]);

  const uploadAttachment = useCallback(async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type
    };
  }, []);

  return {
    messages,
    loading,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    markAsRead,
    setTyping,
    uploadAttachment
  };
};
