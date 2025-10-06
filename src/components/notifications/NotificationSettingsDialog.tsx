import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';

interface NotificationSettingsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationSettingsDialog = ({
  userId,
  open,
  onOpenChange,
}: NotificationSettingsDialogProps) => {
  const { settings, loading, updateSettings, updateCategory } = useNotificationSettings(userId);

  if (!settings) return null;

  const categories = [
    { key: 'jobs', label: 'Jobs & Applications', icon: '💼' },
    { key: 'messages', label: 'Messages', icon: '💬' },
    { key: 'bookings', label: 'Bookings & Appointments', icon: '📅' },
    { key: 'reviews', label: 'Reviews & Ratings', icon: '⭐' },
    { key: 'payments', label: 'Payments & Transactions', icon: '💰' },
    { key: 'system', label: 'System Updates', icon: '🔔' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Manage how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Notification Channels */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Channels</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="in-app">In-App Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show notifications within the app
                    </p>
                  </div>
                </div>
                <Switch
                  id="in-app"
                  checked={settings.in_app_notifications}
                  onCheckedChange={(checked) =>
                    updateSettings({ in_app_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    updateSettings({ email_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                </div>
                <Switch
                  id="push"
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) =>
                    updateSettings({ push_notifications: checked })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Notification Frequency */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Frequency</h3>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <Select
                  value={settings.notification_frequency}
                  onValueChange={(value) =>
                    updateSettings({ notification_frequency: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Quiet Hours */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Quiet Hours</h3>
              <p className="text-xs text-muted-foreground">
                No notifications during these hours
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours_start || ''}
                    onChange={(e) =>
                      updateSettings({ quiet_hours_start: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours_end || ''}
                    onChange={(e) =>
                      updateSettings({ quiet_hours_end: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Notification Categories */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Categories</h3>
              <p className="text-xs text-muted-foreground">
                Choose which types of notifications you want to receive
              </p>
              
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <Label htmlFor={`category-${category.key}`}>
                        {category.label}
                      </Label>
                    </div>
                    <Switch
                      id={`category-${category.key}`}
                      checked={settings.categories[category.key as keyof typeof settings.categories]}
                      onCheckedChange={(checked) =>
                        updateCategory(category.key, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
