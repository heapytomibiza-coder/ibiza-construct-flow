import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useProfiles } from '@/hooks/useProfiles';

interface TypingIndicatorProps {
  conversationId: string;
}

export const TypingIndicator = ({ conversationId }: TypingIndicatorProps) => {
  const { typingUsers, isAnyoneTyping } = useTypingIndicator(conversationId);
  const userIds = typingUsers.map(t => t.user_id);
  const { profiles } = useProfiles(userIds);

  if (!isAnyoneTyping) return null;

  const typingNames = typingUsers
    .map(t => profiles[t.user_id]?.full_name || 'Someone')
    .slice(0, 3);

  let text = '';
  if (typingNames.length === 1) {
    text = `${typingNames[0]} is typing`;
  } else if (typingNames.length === 2) {
    text = `${typingNames[0]} and ${typingNames[1]} are typing`;
  } else if (typingNames.length === 3) {
    text = `${typingNames[0]}, ${typingNames[1]}, and ${typingNames[2]} are typing`;
  } else {
    text = `${typingNames[0]}, ${typingNames[1]}, and ${typingUsers.length - 2} others are typing`;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
      <div className="flex gap-1">
        <span className="animate-bounce delay-0">●</span>
        <span className="animate-bounce delay-75">●</span>
        <span className="animate-bounce delay-150">●</span>
      </div>
      <span>{text}...</span>
    </div>
  );
};
