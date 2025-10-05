import { useAuth } from '@/hooks/useAuth';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const { preferences, loading, updatePreferences } = usePaymentNotifications(user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  const handleChannelToggle = async (channel: 'email_notifications' | 'sms_notifications' | 'push_notifications') => {
    await updatePreferences({
      [channel]: !preferences[channel],
    });
  };

  const handleTypeToggle = async (type: string) => {
    const updatedTypes = {
      ...preferences.notification_types,
      [type]: !preferences.notification_types[type],
    };

    await updatePreferences({
      notification_types: updatedTypes,
    });
  };

  const notificationTypeLabels: Record<string, string> = {
    payment_received: 'Payment Received',
    payment_sent: 'Payment Sent',
    escrow_funded: 'Escrow Funded',
    escrow_released: 'Escrow Released',
    milestone_approved: 'Milestone Approved',
    milestone_rejected: 'Milestone Rejected',
    payout_requested: 'Payout Requested',
    payout_completed: 'Payout Completed',
    invoice_sent: 'Invoice Sent',
    invoice_paid: 'Invoice Paid',
    invoice_overdue: 'Invoice Overdue',
    refund_issued: 'Refund Issued',
    payment_failed: 'Payment Failed',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive payment notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email"
              checked={preferences.email_notifications}
              onCheckedChange={() => handleChannelToggle('email_notifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              id="sms"
              checked={preferences.sms_notifications}
              onCheckedChange={() => handleChannelToggle('sms_notifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive in-app push notifications
              </p>
            </div>
            <Switch
              id="push"
              checked={preferences.push_notifications}
              onCheckedChange={() => handleChannelToggle('push_notifications')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which payment events you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(preferences.notification_types).map(([type, enabled], index) => (
            <div key={type}>
              {index > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={type}>{notificationTypeLabels[type] || type}</Label>
                </div>
                <Switch
                  id={type}
                  checked={enabled}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
