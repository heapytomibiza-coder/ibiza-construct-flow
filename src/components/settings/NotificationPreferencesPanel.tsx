import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Loader2 } from 'lucide-react';

export function NotificationPreferencesPanel() {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const [localPrefs, setLocalPrefs] = useState({
    email_enabled: true,
    push_enabled: false,
    in_app_enabled: true,
    payment_reminder_days: 3,
    invoice_notifications: true,
    payment_confirmation: true,
    dispute_notifications: true
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        email_enabled: preferences.email_enabled,
        push_enabled: preferences.push_enabled,
        in_app_enabled: preferences.push_enabled,
        payment_reminder_days: preferences.payment_reminder_days,
        invoice_notifications: preferences.invoice_notifications,
        payment_confirmation: preferences.payment_confirmation,
        dispute_notifications: preferences.dispute_notifications
      });
    }
  }, [preferences]);

  const handleToggle = (key: keyof typeof localPrefs, value: boolean) => {
    const newPrefs = { ...localPrefs, [key]: value };
    setLocalPrefs(newPrefs);
    updatePreferences(newPrefs);
  };

  const handleReminderDaysChange = (days: string) => {
    const newPrefs = { ...localPrefs, payment_reminder_days: parseInt(days) };
    setLocalPrefs(newPrefs);
    updatePreferences(newPrefs);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={localPrefs.email_enabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              checked={localPrefs.push_enabled}
              onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the app
              </p>
            </div>
            <Switch
              checked={localPrefs.in_app_enabled}
              onCheckedChange={(checked) => handleToggle('in_app_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Preferences</CardTitle>
          <CardDescription>
            Customize notifications for specific events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Invoice Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when invoices are created or updated
              </p>
            </div>
            <Switch
              checked={localPrefs.invoice_notifications}
              onCheckedChange={(checked) => handleToggle('invoice_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Confirmations</Label>
              <p className="text-sm text-muted-foreground">
                Receive confirmation when payments are processed
              </p>
            </div>
            <Switch
              checked={localPrefs.payment_confirmation}
              onCheckedChange={(checked) => handleToggle('payment_confirmation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dispute Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Stay updated on dispute status changes
              </p>
            </div>
            <Switch
              checked={localPrefs.dispute_notifications}
              onCheckedChange={(checked) => handleToggle('dispute_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Reminder Days</Label>
              <p className="text-sm text-muted-foreground">
                How many days before due date to send reminders
              </p>
            </div>
            <Select
              value={localPrefs.payment_reminder_days.toString()}
              onValueChange={handleReminderDaysChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="2">2 days</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
