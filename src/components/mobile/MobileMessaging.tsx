import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMobileKeyboard } from '@/hooks/useMobileKeyboard';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface MobileMessagingProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export const MobileMessaging = ({
  messages,
  onSendMessage,
  currentUserId
}: MobileMessagingProps) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isKeyboardVisible, keyboardHeight } = useMobileKeyboard();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea
        className="flex-1 px-4 py-2"
        ref={scrollRef}
        style={{
          paddingBottom: isKeyboardVisible ? keyboardHeight : 0
        }}
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2',
                msg.isCurrentUser && 'flex-row-reverse'
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.senderAvatar} />
                <AvatarFallback>
                  {msg.senderName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  'flex flex-col gap-1 max-w-[75%]',
                  msg.isCurrentUser && 'items-end'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2',
                    msg.isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
                <span className="text-xs text-muted-foreground px-2">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="pr-10 h-10"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
