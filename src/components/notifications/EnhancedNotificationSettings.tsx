import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Smartphone, MessageSquare, Clock, Shield } from 'lucide-react';
import { usePushNotifications } from '@/hooks/notifications/usePushNotifications';
import { usePhoneVerification } from '@/hooks/notifications/usePhoneVerification';
import { useNotificationPreferences } from '@/hooks/notifications/useNotificationPreferences';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const EnhancedNotificationSettings = () => {
  const {
    preferences,
    loading,
    emailDigestEnabled,
    updateChannel,
    updateEmailDigest,
    updateQuietHours,
  } = useNotificationPreferences();

  const {
    isPushSupported,
    isPushEnabled,
    isSubscribing,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const {
    phoneNumbers,
    addPhoneNumber,
    sendVerificationCode,
    verifyCode,
    verificationCode,
    setVerificationCode,
  } = usePhoneVerification();

  const [newPhone, setNewPhone] = useState('');
  const [quietHoursStart, setQuietHoursStart] = useState(preferences?.quietHours?.start || '22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(preferences?.quietHours?.end || '08:00');
  const [timezone, setTimezone] = useState('UTC');

  const primaryPhone = phoneNumbers?.find(p => p.is_primary);
  const hasSMS = primaryPhone?.is_verified;

  if (loading) {
    return <div className="animate-pulse">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get instant alerts on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPushSupported ? (
            <div className="text-sm text-muted-foreground">
              Push notifications are not supported in your browser
            </div>
          ) : isPushEnabled ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Push Enabled</p>
                  <p className="text-sm text-muted-foreground">You'll receive instant notifications</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => unsubscribe()}
                disabled={isSubscribing}
              >
                Disable
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {permission === 'denied' ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm">
                  <p className="font-medium mb-1">Notifications Blocked</p>
                  <p className="text-muted-foreground">
                    You've blocked notifications. Please enable them in your browser settings.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={() => subscribe()}
                  disabled={isSubscribing}
                  className="w-full"
                >
                  {isSubscribing ? 'Enabling...' : 'Enable Push Notifications'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get important updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailDigestEnabled}
              onCheckedChange={updateEmailDigest}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive urgent alerts via text message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasSMS ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add and verify your phone number to receive SMS alerts
              </p>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
                <Button
                  onClick={() => {
                    addPhoneNumber.mutate(newPhone);
                    setNewPhone('');
                  }}
                  disabled={!newPhone || addPhoneNumber.isPending}
                >
                  Add
                </Button>
              </div>
              
              {/* Show unverified numbers */}
              {phoneNumbers?.filter(p => !p.is_verified).map((phone) => (
                <div key={phone.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{phone.phone_number}</span>
                  <Badge variant="outline">Unverified</Badge>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="w-24"
                    />
                    <Button
                      size="sm"
                      onClick={() => verifyCode.mutate({ phoneId: phone.id, code: verificationCode })}
                      disabled={verifyCode.isPending || !verificationCode}
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => sendVerificationCode.mutate(phone.id)}
                      disabled={sendVerificationCode.isPending}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">{primaryPhone.phone_number}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
                <Badge variant="secondary">Primary</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Only for urgent notifications
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences?.channels?.sms || false}
                  onCheckedChange={(checked) => updateChannel('sms', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Do Not Disturb
          </CardTitle>
          <CardDescription>
            Set quiet hours to avoid interruptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Silence notifications during these hours
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={preferences?.quietHours?.enabled || false}
              onCheckedChange={(checked) =>
                updateQuietHours({
                  enabled: checked,
                  start: quietHoursStart,
                  end: quietHoursEnd,
                })
              }
            />
          </div>

          {preferences?.quietHours?.enabled && (
            <div className="space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => {
                      setQuietHoursStart(e.target.value);
                      updateQuietHours({
                        enabled: true,
                        start: e.target.value,
                        end: quietHoursEnd,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => {
                      setQuietHoursEnd(e.target.value);
                      updateQuietHours({
                        enabled: true,
                        start: quietHoursStart,
                        end: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Your Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Routing Info */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Smart Notification Routing
          </CardTitle>
          <CardDescription>
            Automatic escalation ensures you never miss important updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Push Notification Sent</p>
                <p className="text-muted-foreground">Instant alert on your device</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">If not opened in 2 hours → Email</p>
                <p className="text-muted-foreground">Backup via email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">If urgent and not opened → SMS</p>
                <p className="text-muted-foreground">Critical alerts only</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
