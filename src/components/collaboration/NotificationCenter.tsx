import React from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen = true,
  onClose
}) => {
  const { user } = useAuth();
  const { activities, loading, markAsRead, markAllAsRead, unreadCount } = 
    useActivityFeed(user?.id);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getEventIcon = (eventType: string) => {
    // You can customize icons based on event type
    return <Bell className="h-5 w-5" />;
  };

  if (!isOpen) return null;

  return (
    <Card className="w-96 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  !activity.read_at ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex gap-3">
                  {activity.actor && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.actor.avatar_url || undefined} />
                      <AvatarFallback>
                        {activity.actor.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true
                          })}
                        </p>
                      </div>
                      {!activity.read_at && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {activity.action_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = activity.action_url!}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View
                        </Button>
                      )}
                      {!activity.read_at && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(activity.id)}
                        >
                          <Check className="h-3 w-3 mr-2" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
