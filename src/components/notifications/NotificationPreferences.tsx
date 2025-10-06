import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  payment_reminder_days: number;
  invoice_notifications: boolean;
  payment_confirmation: boolean;
  dispute_notifications: boolean;
}

export function NotificationPreferences() {
  const queryClient = useQueryClient();
  const [reminderDays, setReminderDays] = useState(3);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setReminderDays(data.payment_reminder_days);
      }
      
      return data as NotificationPreference | null;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error }: any = await (supabase as any)
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleToggle = (field: keyof NotificationPreference, value: boolean) => {
    updatePreferences.mutate({ [field]: value });
  };

  const handleReminderDaysChange = () => {
    if (reminderDays < 1 || reminderDays > 30) {
      toast.error('Reminder days must be between 1 and 30');
      return;
    }
    updatePreferences.mutate({ payment_reminder_days: reminderDays });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  const currentPrefs = preferences || {
    email_enabled: true,
    sms_enabled: false,
    push_enabled: false,
    payment_reminder_days: 3,
    invoice_notifications: true,
    payment_confirmation: true,
    dispute_notifications: true,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about payments and invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Notification Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-enabled">Email Notifications</Label>
            </div>
            <Switch
              id="email-enabled"
              checked={currentPrefs.email_enabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sms-enabled">SMS Notifications</Label>
            </div>
            <Switch
              id="sms-enabled"
              checked={currentPrefs.sms_enabled}
              onCheckedChange={(checked) => handleToggle('sms_enabled', checked)}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push-enabled">Push Notifications</Label>
            </div>
            <Switch
              id="push-enabled"
              checked={currentPrefs.push_enabled}
              onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
              disabled
            />
          </div>
        </div>

        {/* Payment Reminder Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Payment Reminders</h3>
          
          <div className="space-y-2">
            <Label htmlFor="reminder-days">Send reminders (days before due date)</Label>
            <div className="flex gap-2">
              <Input
                id="reminder-days"
                type="number"
                min="1"
                max="30"
                value={reminderDays}
                onChange={(e) => setReminderDays(parseInt(e.target.value) || 3)}
                className="w-24"
              />
              <Button
                onClick={handleReminderDaysChange}
                variant="outline"
                size="sm"
              >
                Update
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive reminders {reminderDays} day{reminderDays !== 1 ? 's' : ''} before payments are due
            </p>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Notification Types</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="invoice-notifications">Invoice Updates</Label>
            <Switch
              id="invoice-notifications"
              checked={currentPrefs.invoice_notifications}
              onCheckedChange={(checked) => handleToggle('invoice_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="payment-confirmation">Payment Confirmations</Label>
            <Switch
              id="payment-confirmation"
              checked={currentPrefs.payment_confirmation}
              onCheckedChange={(checked) => handleToggle('payment_confirmation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dispute-notifications">Dispute Notifications</Label>
            <Switch
              id="dispute-notifications"
              checked={currentPrefs.dispute_notifications}
              onCheckedChange={(checked) => handleToggle('dispute_notifications', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
