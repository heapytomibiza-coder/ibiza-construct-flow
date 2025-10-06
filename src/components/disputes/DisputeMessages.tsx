import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDisputes } from '@/hooks/useDisputes';
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DisputeMessagesProps {
  disputeId: string;
}

export const DisputeMessages = ({ disputeId }: DisputeMessagesProps) => {
  const [message, setMessage] = useState('');
  const { messages, messagesLoading, sendMessage } = useDisputes(undefined, disputeId);

  const handleSend = async () => {
    if (!message.trim()) return;

    await sendMessage.mutateAsync({
      disputeId,
      message: message.trim(),
    });

    setMessage('');
  };

  if (messagesLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {messages?.map((msg: any) => (
          <div key={msg.id} className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={msg.sender?.avatar_url} />
              <AvatarFallback>
                {msg.sender?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {msg.sender?.full_name || 'User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(msg.created_at))} ago
                </span>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}

        {(!messages || messages.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation.</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
          size="icon"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};
