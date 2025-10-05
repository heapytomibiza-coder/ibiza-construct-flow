import { useAuth } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { Badge } from '@/components/ui/badge';

export const UnreadMessageBadge = () => {
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount(user?.id);

  if (!unreadCount || unreadCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 text-xs"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
};
