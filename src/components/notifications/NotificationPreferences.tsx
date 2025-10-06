import { useState } from 'react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const notificationTypeLabels: Record<string, string> = {
  booking_request: 'Booking Requests',
  booking_confirmed: 'Booking Confirmations',
  booking_cancelled: 'Booking Cancellations',
  booking_completed: 'Booking Completions',
  message_received: 'New Messages',
  review_received: 'New Reviews',
  payment_received: 'Payment Received',
  payment_due: 'Payment Reminders',
  verification_approved: 'Verification Approved',
  verification_rejected: 'Verification Rejected',
  job_application: 'Job Applications',
  job_accepted: 'Job Acceptances',
  job_declined: 'Job Declines',
  milestone_completed: 'Milestone Completions',
  dispute_opened: 'Disputes Opened',
  dispute_resolved: 'Disputes Resolved',
  system_announcement: 'System Announcements',
  promotional: 'Promotional Messages'
};

export const NotificationPreferences = () => {
  const { preferences, isLoading, updatePreference, toggleChannel } = useNotificationPreferences();
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    requestPermission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleNotification = async (notificationType: string, enabled: boolean) => {
    setIsUpdating(true);
    try {
      await updatePreference(notificationType, { enabled });
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleChannel = async (notificationType: string, channel: string) => {
    setIsUpdating(true);
    try {
      await toggleChannel(notificationType, channel);
      toast({
        title: 'Preferences updated',
        description: 'Your notification channels have been updated.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update channel. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePushNotificationToggle = async () => {
    if (!isSupported) {
      toast({
        title: 'Not supported',
        description: 'Push notifications are not supported in your browser.',
        variant: 'destructive'
      });
      return;
    }

    if (permission === 'denied') {
      toast({
        title: 'Permission denied',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive'
      });
      return;
    }

    if (isSubscribed) {
      await unsubscribe();
      toast({
        title: 'Unsubscribed',
        description: 'You will no longer receive push notifications.'
      });
    } else {
      if (permission === 'default') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      
      const success = await subscribe();
      if (success) {
        toast({
          title: 'Subscribed',
          description: 'You will now receive push notifications.'
        });
      }
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push': return <Bell className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'in_app': return <MessageSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Enable browser push notifications to stay updated in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {isSupported ? (
                  isSubscribed ? 'Enabled' : 'Disabled'
                ) : 'Not supported'}
              </p>
            </div>
            <Button
              variant={isSubscribed ? 'destructive' : 'default'}
              onClick={handlePushNotificationToggle}
              disabled={!isSupported || permission === 'denied'}
            >
              {isSubscribed ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Choose what notifications you want to receive and how
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(notificationTypeLabels).map(([type, label]) => {
            const preference = preferences.find(p => p.notification_type === type);
            const enabled = preference?.enabled ?? true;
            const channels = preference?.channels ?? ['in_app', 'email'];

            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={type} className="text-base">
                    {label}
                  </Label>
                  <Switch
                    id={type}
                    checked={enabled}
                    onCheckedChange={(checked) => handleToggleNotification(type, checked)}
                    disabled={isUpdating}
                  />
                </div>

                {enabled && (
                  <div className="flex flex-wrap gap-2 pl-6">
                    {['in_app', 'email', 'push', 'sms'].map((channel) => (
                      <Badge
                        key={channel}
                        variant={channels.includes(channel) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleToggleChannel(type, channel)}
                      >
                        {getChannelIcon(channel)}
                        <span className="ml-1 capitalize">{channel.replace('_', ' ')}</span>
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
