import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachments?: any;
  read_at?: string | null;
  created_at: string;
}

interface TypingUser {
  user_id: string;
  timestamp: string;
}

export const useRealtimeMessages = (conversationId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [conversationId]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string, attachments: any[] = []) => {
    if (!user) return;

    // Get conversation to find recipient
    const { data: conv } = await supabase
      .from("conversations")
      .select("participant_1_id, participant_2_id")
      .eq("id", conversationId)
      .single();

    if (!conv) return;

    const recipientId =
      conv.participant_1_id === user.id
        ? conv.participant_2_id
        : conv.participant_1_id;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      recipient_id: recipientId,
      content,
      attachments,
    });

    if (error) throw error;
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("recipient_id", user.id);
  };

  const setTyping = async (isTyping: boolean) => {
    // Placeholder for typing indicator functionality
    // Can be implemented with a separate typing_indicators table if needed
  };

  const uploadAttachment = async (file: File) => {
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${conversationId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("message-attachments")
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("message-attachments")
      .getPublicUrl(fileName);

    return {
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
    };
  };

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    markAsRead,
    setTyping,
    uploadAttachment,
  };
};
