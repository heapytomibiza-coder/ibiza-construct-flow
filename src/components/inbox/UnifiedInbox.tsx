import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, DollarSign, CreditCard, Bell } from 'lucide-react';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { cn } from '@/lib/utils';

export const UnifiedInbox = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { notifications, unreadCount, loading } = useNotificationCenter();

  // Filter notifications by type
  const getNotificationsByType = (type?: string) => {
    if (!type || type === 'all') return notifications;
    return notifications.filter(n => n.notification_type === type);
  };

  const tabs = [
    {
      value: 'all',
      label: 'All',
      icon: Bell,
      count: notifications.length,
    },
    {
      value: 'message',
      label: 'Messages',
      icon: MessageSquare,
      count: getNotificationsByType('message').length,
    },
    {
      value: 'offer',
      label: 'Offers',
      icon: DollarSign,
      count: getNotificationsByType('offer').length,
    },
    {
      value: 'payment',
      label: 'Payments',
      icon: CreditCard,
      count: getNotificationsByType('payment').length,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading inbox...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inbox</h2>
        {unreadCount > 0 && (
          <Badge variant="default" className="h-6">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.count > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {tab.count > 99 ? '99+' : tab.count}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-3 mt-0">
              {getNotificationsByType(tab.value === 'all' ? undefined : tab.value).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <tab.icon className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="font-medium">No {tab.label.toLowerCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                getNotificationsByType(tab.value === 'all' ? undefined : tab.value).map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary",
                      !notification.read_at ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        notification.priority === 'high' ? "bg-red-100" :
                        notification.priority === 'urgent' ? "bg-orange-100" :
                        "bg-secondary"
                      )}>
                        {notification.notification_type === 'message' && <MessageSquare className="w-4 h-4" />}
                        {notification.notification_type === 'offer' && <DollarSign className="w-4 h-4" />}
                        {notification.notification_type === 'payment' && <CreditCard className="w-4 h-4" />}
                        {!notification.notification_type && <Bell className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.read_at && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>

                        {notification.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          {notification.priority && notification.priority !== 'normal' && (
                            <Badge
                              variant={notification.priority === 'urgent' ? 'destructive' : 'default'}
                              className="text-xs h-5"
                            >
                              {notification.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
};
