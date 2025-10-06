import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageReactionsProps {
  messageId: string;
  compact?: boolean;
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '👏'];

export const MessageReactions = ({ messageId, compact = false }: MessageReactionsProps) => {
  const { toggleReaction, getReactionSummary } = useMessageReactions(messageId);
  const [showPicker, setShowPicker] = useState(false);
  const summary = getReactionSummary();

  const handleReactionClick = async (reaction: string) => {
    await toggleReaction(reaction);
    setShowPicker(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {summary.length > 0 && (
        <div className="flex gap-1">
          {summary.map(({ reaction, count, hasReacted, userIds }) => (
            <TooltipProvider key={reaction}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={hasReacted ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleReactionClick(reaction)}
                    className={cn(
                      'h-7 px-2 gap-1',
                      hasReacted && 'bg-primary/20 hover:bg-primary/30'
                    )}
                  >
                    <span className="text-base">{reaction}</span>
                    <span className="text-xs">{count}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    {count === 1 ? '1 person' : `${count} people`} reacted with {reaction}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', compact && 'h-6 w-6')}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-8 gap-1">
            {COMMON_REACTIONS.map(reaction => (
              <Button
                key={reaction}
                variant="ghost"
                size="sm"
                onClick={() => handleReactionClick(reaction)}
                className="h-10 w-10 p-0 text-xl hover:bg-accent"
              >
                {reaction}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
