import React from 'react';
import { useConversationList } from '@/hooks/useConversationList';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ConversationsListProps {
  onConversationSelect?: (conversationId: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ onConversationSelect }) => {
  const { user } = useAuth();
  const { conversations, loading, totalUnread } = useConversationList(user?.id);
  const navigate = useNavigate();

  const handleConversationClick = (conversationId: string) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    } else {
      navigate(`/dashboard?conversation=${conversationId}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading conversations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </span>
          {totalUnread > 0 && (
            <Badge variant="default">{totalUnread} unread</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start chatting with professionals or clients</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const otherParticipantId = conversation.participants.find(p => p !== user?.id);
                const hasUnread = (conversation.unread_count || 0) > 0;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                      hasUnread ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {otherParticipantId?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            Conversation
                          </p>
                          {conversation.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.last_message_at), { 
                                addSuffix: true 
                              })}
                            </span>
                          )}
                        </div>
                        
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message.sender_id === user?.id && 'You: '}
                            {conversation.last_message.content}
                          </p>
                        )}
                        
                        {conversation.job_id && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Job Related
                          </Badge>
                        )}
                      </div>
                      
                      {hasUnread && (
                        <Badge variant="default" className="shrink-0">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
