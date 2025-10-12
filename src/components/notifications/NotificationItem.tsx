/**
 * Notification Item Component
 * Phase 25: Advanced Notification & Communication System
 */

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/lib/notifications/types';
import { useNotifications } from '@/hooks/notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = async () => {
    if (notification.status !== 'read') {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  return (
    <div className={cn('p-4 hover:bg-accent/50 cursor-pointer transition-colors', notification.status === 'read' && 'opacity-60')} onClick={handleClick}>
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notification.message}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{notification.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
