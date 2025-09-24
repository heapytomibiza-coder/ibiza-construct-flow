import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Check, ExternalLink } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { cn } from '@/lib/utils';

interface RealtimeNotificationsProps {
  userId: string;
}

export const RealtimeNotifications = ({ userId }: RealtimeNotificationsProps) => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markNotificationAsRead, connected } = useRealtimeUpdates(userId);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read_at) {
      markNotificationAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const markAllAsRead = () => {
    notifications
      .filter(n => !n.read_at)
      .forEach(n => markNotificationAsRead(n.id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {connected ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4 opacity-50" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connected ? "bg-green-500" : "bg-red-500"
            )} />
            {unreadCount > 0 && (
              <Button
                variant="ghost"  
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-auto p-1"  
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.read_at && "bg-primary/5 border border-primary/10"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      {notification.action_url && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notification.id);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {!connected && (
          <div className="p-3 bg-yellow-50 border-t">
            <p className="text-xs text-yellow-700">
              ⚠️ Connection lost - reconnecting...
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};