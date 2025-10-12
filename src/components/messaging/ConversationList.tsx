import { useConversations } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string, otherUserId: string) => void;
}

export const ConversationList = ({
  selectedConversationId,
  onConversationSelect,
}: ConversationListProps) => {
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();

  // Fetch profiles for all conversation participants
  const { data: profiles } = useQuery({
    queryKey: ["conversation-profiles", conversations],
    queryFn: async () => {
      if (!conversations || conversations.length === 0) return {};

      const userIds = new Set<string>();
      conversations.forEach((conv) => {
        userIds.add(conv.participant_1_id);
        userIds.add(conv.participant_2_id);
      });

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", Array.from(userIds));

      if (error) throw error;

      return data.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!conversations && conversations.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
        <p className="text-muted-foreground text-sm">
          Start a conversation from a job posting or professional profile
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const otherUserId =
            conversation.participant_1_id === user?.id
              ? conversation.participant_2_id
              : conversation.participant_1_id;
          
          const otherUser = profiles?.[otherUserId];
          const isSelected = conversation.id === selectedConversationId;

          return (
            <Button
              key={conversation.id}
              variant={isSelected ? "secondary" : "ghost"}
              className="w-full justify-start h-auto py-3 px-3"
              onClick={() => onConversationSelect(conversation.id, otherUserId)}
            >
              <div className="flex items-start gap-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser?.avatar_url} />
                  <AvatarFallback>
                    {(otherUser?.full_name || otherUser?.display_name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">
                      {otherUser?.full_name || otherUser?.display_name || "User"}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {conversation.job_id && (
                    <p className="text-xs text-muted-foreground">
                      Related to job
                    </p>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
