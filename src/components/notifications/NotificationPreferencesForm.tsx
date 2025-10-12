/**
 * Notification Preferences Form
 * Phase 25: Advanced Notification & Communication System
 * 
 * Form for managing notification preferences
 */

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/notifications';

export function NotificationPreferencesForm() {
  const {
    preferences,
    loading,
    updateChannel,
    updateCategory,
    updateQuietHours,
    resetToDefaults,
  } = useNotificationPreferences();

  if (loading || !preferences) {
    return <div>Loading preferences...</div>;
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
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications within the application
              </p>
            </div>
            <Switch
              checked={preferences.channels.in_app}
              onCheckedChange={(checked) => updateChannel('in_app', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.channels.email}
              onCheckedChange={(checked) => updateChannel('email', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              checked={preferences.channels.push}
              onCheckedChange={(checked) => updateChannel('push', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              checked={preferences.channels.sms}
              onCheckedChange={(checked) => updateChannel('sms', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.categories).map(([category, enabled]) => (
            <div key={category}>
              <div className="flex items-center justify-between">
                <Label className="capitalize">{category}</Label>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    updateCategory(category as any, checked)
                  }
                />
              </div>
              {category !== 'marketing' && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Quiet Hours</Label>
            <Switch
              checked={preferences.quietHours?.enabled || false}
              onCheckedChange={(checked) =>
                updateQuietHours({
                  ...preferences.quietHours,
                  enabled: checked,
                  start: preferences.quietHours?.start || '22:00',
                  end: preferences.quietHours?.end || '08:00',
                })
              }
            />
          </div>

          {preferences.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) =>
                    updateQuietHours({
                      ...preferences.quietHours!,
                      start: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) =>
                    updateQuietHours({
                      ...preferences.quietHours!,
                      end: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" onClick={resetToDefaults}>
        Reset to Defaults
      </Button>
    </div>
  );
}
