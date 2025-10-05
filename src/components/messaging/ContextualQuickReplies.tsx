import { useTranslation } from 'react-i18next';
import { QUICK_REPLIES } from '@/lib/ibiza-defaults';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ContextualQuickRepliesProps {
  conversationContext?: {
    hasPhotos?: boolean;
    isPendingSchedule?: boolean;
    isNearCompletion?: boolean;
    lastMessageType?: string;
  };
  onSelectReply: (reply: string) => void;
}

export const ContextualQuickReplies = ({
  conversationContext = {},
  onSelectReply
}: ContextualQuickRepliesProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language as 'en' | 'es';
  const replies = QUICK_REPLIES[locale];

  // Smart contextual suggestions
  const getContextualReplies = () => {
    const suggestions: string[] = [];

    // Always include accept
    suggestions.push(replies.accept);

    // Context-based suggestions
    if (!conversationContext.hasPhotos) {
      suggestions.push(replies.requestPhotos);
    }

    if (conversationContext.isPendingSchedule) {
      suggestions.push(replies.availableTomorrow);
      suggestions.push(replies.checkingSchedule);
    }

    if (conversationContext.isNearCompletion) {
      suggestions.push(replies.confirmed);
      suggestions.push(replies.thankYou);
    } else {
      suggestions.push(replies.needMoreInfo);
      suggestions.push(replies.almostThere);
    }

    return suggestions.slice(0, 6); // Max 6 quick replies
  };

  const contextualReplies = getContextualReplies();

  return (
    <div className="border-t bg-background" role="region" aria-label="Quick reply suggestions">
      <ScrollArea className="w-full">
        <div className="flex gap-2 p-3" role="list">
          {contextualReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelectReply(reply)}
              className="shrink-0 rounded-full min-h-[44px] h-auto px-4 hover:bg-primary hover:text-primary-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Send quick reply: ${reply}`}
              role="listitem"
            >
              {reply}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
