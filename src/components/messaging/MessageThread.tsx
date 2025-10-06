import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { useMessageSafety } from '@/hooks/useMessageSafety';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { BlockUserDialog } from './BlockUserDialog';
import { ReportMessageDialog } from './ReportMessageDialog';
import { Loader2, MessageSquare, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  const [isSending, setIsSending] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

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

  const {
    checkIfBlocked,
    checkRateLimit,
    checkSpamContent
  } = useMessageSafety(userId);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, markAsRead]);

  // Check if user is blocked
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (recipientId) {
        const blocked = await checkIfBlocked(recipientId);
        setIsBlocked(blocked);
      }
    };
    checkBlockStatus();
  }, [recipientId, checkIfBlocked]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    // Check if blocked
    if (isBlocked) {
      setRateLimitWarning('Cannot send messages to this user.');
      return;
    }

    // Check rate limit
    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      if (rateCheck.reason === 'rate_limit_exceeded') {
        setRateLimitWarning('You\'ve reached the message limit. Please try again later.');
      } else if (rateCheck.retry_after) {
        const minutes = Math.ceil(rateCheck.retry_after / 60);
        setRateLimitWarning(`Rate limited. Try again in ${minutes} minutes.`);
      }
      return;
    }

    // Check spam
    const spamCheck = await checkSpamContent(content);
    if (spamCheck.is_spam && spamCheck.severity === 'high') {
      setRateLimitWarning('Message contains prohibited content.');
      return;
    }

    setIsSending(true);
    setRateLimitWarning(null);
    try {
      await sendMessage({
        conversationId,
        recipientId,
        content,
        attachments,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    updateTypingStatus(isTyping);
  };

  const handleReportMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    setReportDialogOpen(true);
  };

  const handleBlockUser = () => {
    setBlockDialogOpen(true);
  };

  if (messagesLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        {isBlocked && (
          <Alert variant="destructive" className="m-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              This user has blocked you. You cannot send messages.
            </AlertDescription>
          </Alert>
        )}

        {rateLimitWarning && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {rateLimitWarning}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRateLimitWarning(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message: any) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === userId}
                  onReact={(reaction) =>
                    addReaction({ messageId: message.id, reaction })
                  }
                  onDelete={() => deleteMessage(message.id)}
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

        <div className="p-4 border-t space-y-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBlockUser}
              className="gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Block User
            </Button>
          </div>
          <MessageInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={isSending || isBlocked}
          />
        </div>
      </Card>

      <BlockUserDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        targetUserId={recipientId}
        targetUserName="User"
        onBlocked={() => setIsBlocked(true)}
      />

      {selectedMessageId && (
        <ReportMessageDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          messageId={selectedMessageId}
          onReported={() => setReportDialogOpen(false)}
        />
      )}
    </>
  );
};
