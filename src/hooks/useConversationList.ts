import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface ConversationWithDetails {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  job_id?: string;
  contract_id?: string;
  last_message_at: string;
  created_at: string;
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count?: number;
}

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
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
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
          // Fetch last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("id, content, sender_id, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("recipient_id", userId)
            .is("read_at", null);

          return {
            ...conv,
            last_message: lastMsg || undefined,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
      setTotalUnread(
        conversationsWithDetails.reduce((sum, c) => sum + (c.unread_count || 0), 0)
      );
    };

    fetchConversationsWithMessages();
  }, [data, userId]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `participant_1_id=eq.${userId}`,
        },
        () => {
          // Refetch when conversations change
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `participant_2_id=eq.${userId}`,
        },
        () => {
          // Refetch when conversations change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    conversations,
    loading: isLoading,
    totalUnread,
  };
};
