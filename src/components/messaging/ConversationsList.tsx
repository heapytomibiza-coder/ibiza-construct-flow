import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { MessageSquare, Search, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  userId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationsList = ({
  userId,
  selectedConversationId,
  onSelectConversation,
}: ConversationsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { conversations, conversationsLoading, unreadCount } = useMessaging(userId);

  if (conversationsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  const filteredConversations = conversations?.filter((conv: any) => {
    // Add search filtering logic here
    return true;
  });

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
          </h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredConversations && filteredConversations.length > 0 ? (
          <div className="p-2">
            {filteredConversations.map((conversation: any) => {
              const isSelected = conversation.id === selectedConversationId;
              const otherParticipant = conversation.participants?.find(
                (p: string) => p !== userId
              );

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-colors hover:bg-muted',
                    isSelected && 'bg-muted'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {otherParticipant?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {conversation.subject || 'Conversation'}
                        </p>
                        {conversation.last_message_at && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(conversation.last_message_at), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Click to view conversation
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm">Start a conversation to get connected</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
