import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, FileText } from 'lucide-react';

interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onTemplatePick?: () => void;
}

export function MessageComposer({ onSend, disabled, onTemplatePick }: MessageComposerProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a clear, factual message... (Enter to send, Shift+Enter for new line)"
        rows={3}
        disabled={disabled}
        className="resize-none"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onTemplatePick && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onTemplatePick}
              disabled={disabled}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {text.length} characters
          </span>
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
