import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, BellOff, Check, X, Settings, 
  MessageSquare, CreditCard, AlertCircle, 
  CheckCircle, Clock, Star, Briefcase,
  Filter, Search, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'payment' | 'job_update' | 'review' | 'system' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  relatedJobId?: string;
  relatedJobTitle?: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    messages: boolean;
    payments: boolean;
    jobUpdates: boolean;
    reviews: boolean;
    system: boolean;
    marketing: boolean;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Quote Received',
    message: 'Maria Santos has sent you a quote for your Bathroom Renovation project.',
    type: 'job_update',
    priority: 'high',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    actionRequired: true,
    relatedJobId: 'job-1',
    relatedJobTitle: 'Bathroom Renovation'
  },
  {
    id: '2',
    title: 'Payment Processed',
    message: 'Your payment of €850 has been successfully processed and held in escrow.',
    type: 'payment',
    priority: 'medium',
    timestamp: '2024-01-15T09:15:00Z',
    read: false,
    actionRequired: false,
    relatedJobId: 'job-1',
    relatedJobTitle: 'Bathroom Renovation'
  },
  {
    id: '3',
    title: 'New Message',
    message: 'João Silva: "I can start the plumbing work tomorrow morning at 9 AM."',
    type: 'message',
    priority: 'medium',
    timestamp: '2024-01-14T16:45:00Z',
    read: true,
    actionRequired: false,
    relatedJobId: 'job-2',
    relatedJobTitle: 'Kitchen Plumbing'
  },
  {
    id: '4',
    title: 'Job Completed - Please Review',
    message: 'Ahmed Al-Rashid has marked your Tiling Project as completed. Please review the work.',
    type: 'review',
    priority: 'medium',
    timestamp: '2024-01-14T14:20:00Z',
    read: true,
    actionRequired: true,
    relatedJobId: 'job-3',
    relatedJobTitle: 'Tiling Project'
  },
  {
    id: '5',
    title: 'Reminder: Upcoming Appointment',
    message: 'You have a scheduled appointment tomorrow at 10:00 AM for your Electrical Upgrade.',
    type: 'reminder',
    priority: 'high',
    timestamp: '2024-01-13T18:00:00Z',
    read: true,
    actionRequired: false,
    relatedJobId: 'job-4',
    relatedJobTitle: 'Electrical Upgrade'
  }
];

const mockSettings: NotificationSettings = {
  email: true,
  push: true,
  sms: false,
  categories: {
    messages: true,
    payments: true,
    jobUpdates: true,
    reviews: true,
    system: true,
    marketing: false
  }
};

export const ClientNotificationsView = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState(mockSettings);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'job_update': return <Briefcase className="w-4 h-4 text-copper" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'reminder': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesRead = !showUnreadOnly || !notif.read;
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateSettings = (key: string, value: boolean, category?: string) => {
    if (category) {
      setSettings(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal flex items-center gap-2">
            <Bell className="w-6 h-6 text-copper" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Stay updated with your projects and messages</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'notifications' ? (
        <>
          {/* Filters */}
          <Card className="card-luxury">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="message">Messages</option>
                    <option value="payment">Payments</option>
                    <option value="job_update">Job Updates</option>
                    <option value="review">Reviews</option>
                    <option value="reminder">Reminders</option>
                    <option value="system">System</option>
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showUnreadOnly}
                      onCheckedChange={setShowUnreadOnly}
                    />
                    <span className="text-sm text-muted-foreground">Unread only</span>
                  </div>
                </div>
                
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={cn(
                    "card-luxury transition-all duration-200 border-l-4",
                    getPriorityColor(notification.priority),
                    !notification.read && "shadow-luxury"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              "font-medium",
                              !notification.read ? "text-charcoal font-semibold" : "text-muted-foreground"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-copper rounded-full"></div>
                            )}
                            {notification.actionRequired && (
                              <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {new Date(notification.timestamp).toLocaleString()}
                            </span>
                            {notification.relatedJobTitle && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {notification.relatedJobTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {notification.actionRequired && (
                          <Button size="sm" className="bg-gradient-hero text-white">
                            Take Action
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="card-luxury">
                <CardContent className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-display font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {showUnreadOnly 
                      ? 'All caught up! No unread notifications.' 
                      : 'You\'ll see notifications here when there are updates to your projects.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        /* Settings Tab */
        <div className="space-y-6">
          {/* Delivery Methods */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Notification Delivery</CardTitle>
              <p className="text-sm text-muted-foreground">Choose how you want to receive notifications</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-charcoal">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(value) => updateSettings('email', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-charcoal">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Browser and mobile push notifications</p>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(value) => updateSettings('push', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-charcoal">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground">Text message notifications for urgent items</p>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={(value) => updateSettings('sms', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Notification Categories</CardTitle>
              <p className="text-sm text-muted-foreground">Control what types of notifications you receive</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-charcoal">Messages</h4>
                    <p className="text-sm text-muted-foreground">New messages from professionals</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.messages}
                  onCheckedChange={(value) => updateSettings('messages', value, 'messages')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-green-500" />
                  <div>
                    <h4 className="font-medium text-charcoal">Payments</h4>
                    <p className="text-sm text-muted-foreground">Payment confirmations and invoice updates</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.payments}
                  onCheckedChange={(value) => updateSettings('payments', value, 'payments')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-copper" />
                  <div>
                    <h4 className="font-medium text-charcoal">Job Updates</h4>
                    <p className="text-sm text-muted-foreground">Status changes and progress updates</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.jobUpdates}
                  onCheckedChange={(value) => updateSettings('jobUpdates', value, 'jobUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <h4 className="font-medium text-charcoal">Reviews</h4>
                    <p className="text-sm text-muted-foreground">Review requests and responses</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.reviews}
                  onCheckedChange={(value) => updateSettings('reviews', value, 'reviews')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-charcoal">System Updates</h4>
                    <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.system}
                  onCheckedChange={(value) => updateSettings('system', value, 'system')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-purple-500" />
                  <div>
                    <h4 className="font-medium text-charcoal">Marketing</h4>
                    <p className="text-sm text-muted-foreground">Tips, promotions, and product updates</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.marketing}
                  onCheckedChange={(value) => updateSettings('marketing', value, 'marketing')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};