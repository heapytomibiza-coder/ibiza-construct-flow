import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import type { Message, Conversation } from "@/types/messaging";

export const useMessages = (conversationId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch messages for a conversation
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ 
      content, 
      message_type = 'text',
      file_url,
      file_name
    }: { 
      content: string; 
      message_type?: 'text' | 'file' | 'image' | 'quote';
      file_url?: string;
      file_name?: string;
    }) => {
      if (!conversationId || !user?.id) {
        throw new Error("Missing conversation or user");
      }

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type,
          file_url,
          file_name,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", messageIds)
        .is("read_at", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Get or create conversation
  const getOrCreateConversation = useMutation({
    mutationFn: async ({
      clientId,
      professionalId,
      jobId,
    }: {
      clientId: string;
      professionalId: string;
      jobId?: string;
    }) => {
      // Check if conversation exists
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .eq("client_id", clientId)
        .eq("professional_id", professionalId)
        .eq("job_id", jobId || '')
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existing) return existing;

      // Create new conversation
      const { data: newConv, error: insertError } = await supabase
        .from("conversations")
        .insert({
          client_id: clientId,
          professional_id: professionalId,
          job_id: jobId,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newConv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    getOrCreateConversation,
  };
};
