import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { Loader2, MessageSquare } from 'lucide-react';

interface MessageThreadProps {
  conversationId: string;
  userId: string;
  recipientId: string;
}

export const MessageThread = ({
  conversationId,
  userId,
  recipientId,
}: MessageThreadProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    messagesLoading,
    typingUsers,
    sendMessage,
    markAsRead,
    updateTypingStatus,
    addReaction,
    deleteMessage,
  } = useMessaging(userId, conversationId);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    await sendMessage.mutateAsync({
      conversationId,
      recipientId,
      content,
      attachments,
    });
  };

  const handleTyping = (isTyping: boolean) => {
    updateTypingStatus(isTyping);
  };

  if (messagesLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === userId}
                onReact={(reaction) =>
                  addReaction.mutate({ messageId: message.id, reaction })
                }
                onDelete={() => deleteMessage.mutate(message.id)}
              />
            ))}
            {typingUsers.size > 0 && <TypingIndicator />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <MessageInput
          onSend={handleSendMessage}
          onTyping={handleTyping}
          disabled={sendMessage.isPending}
        />
      </div>
    </Card>
  );
};
