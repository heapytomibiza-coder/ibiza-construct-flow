import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string, attachments?: any[]) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({
  onSend,
  onTyping,
  disabled,
  placeholder = 'Type a message...',
}: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleContentChange = (value: string) => {
    setContent(value);

    // Notify typing
    onTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;

    try {
      setSending(true);
      await onSend(content, attachments);
      setContent('');
      setAttachments([]);
      onTyping(false);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="text-xs bg-muted rounded px-2 py-1 flex items-center gap-1"
            >
              📎 {file.name}
              <button
                onClick={() =>
                  setAttachments(attachments.filter((_, i) => i !== index))
                }
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            className="min-h-[40px] max-h-[200px] resize-none pr-20"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={disabled || sending}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={disabled || sending}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || disabled || sending}
          size="icon"
          className="shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};
