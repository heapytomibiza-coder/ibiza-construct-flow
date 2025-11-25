import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { ConversationWithDetails } from "@/types/messaging";

export const useConversationList = (userId?: string) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    const fetchConversationsWithMessages = async () => {
      if (!data || !userId) {
        setConversations([]);
        setTotalUnread(0);
        return;
      }

      const conversationsWithDetails = await Promise.all(
        data.map(async (conv) => {
          // Get other user info
          const otherUserId = conv.client_id === userId ? conv.professional_id : conv.client_id;
          
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, sender_id, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

          return {
            ...conv,
            other_user: otherUser || undefined,
            last_message: lastMessage || undefined,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails as ConversationWithDetails[]);
      setTotalUnread(conversationsWithDetails.reduce((sum, conv) => sum + conv.unread_count, 0));
    };

    fetchConversationsWithMessages();
  }, [data, userId]);

  return {
    conversations,
    totalUnread,
    isLoading,
  };
};
