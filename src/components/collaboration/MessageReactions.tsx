import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { Smile } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  className?: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

export const MessageReactions = ({ messageId, className = '' }: MessageReactionsProps) => {
  const { toggleReaction, getReactionSummary } = useMessageReactions(messageId);
  const [isOpen, setIsOpen] = useState(false);
  const groupedReactions = getReactionSummary();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Display existing reactions */}
      {groupedReactions.map((group) => (
        <Button
          key={group.reaction}
          variant={group.hasReacted ? 'default' : 'secondary'}
          size="sm"
          className="h-7 px-2 text-sm"
          onClick={() => toggleReaction(group.reaction)}
        >
          <span className="mr-1">{group.reaction}</span>
          <span className="text-xs">{group.count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-xl hover:scale-125 transition-transform"
                onClick={() => {
                  toggleReaction(emoji);
                  setIsOpen(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
