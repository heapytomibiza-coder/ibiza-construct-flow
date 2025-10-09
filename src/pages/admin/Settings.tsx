import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Mail, 
  Flag, 
  Bell,
  Save,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: featureFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('feature_flags')
        .select('*')
        .order('key');
      if (error) throw error;
      return data as FeatureFlag[];
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ flagKey, enabled }: { flagKey: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: enabled })
        .eq('key', flagKey);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Feature Updated',
        description: 'Feature flag has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update feature flag.',
        variant: 'destructive',
      });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">System Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="features">
              <Flag className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  General platform settings and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Admin Console" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@platform.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-upload-size">Max Upload Size (MB)</Label>
                  <Input id="max-upload-size" type="number" defaultValue="10" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to show maintenance page to users
                    </p>
                  </div>
                  <Switch />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>
                  Configure API and action rate limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-rate-limit">API Requests per Minute</Label>
                  <Input id="api-rate-limit" type="number" defaultValue="100" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message-rate-limit">Messages per Hour</Label>
                  <Input id="message-rate-limit" type="number" defaultValue="50" />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Configure authentication and security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-min-length">Minimum Password Length</Label>
                  <Input id="password-min-length" type="number" defaultValue="8" />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IP Whitelist</CardTitle>
                <CardDescription>
                  Manage allowed IP addresses for admin access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  IP whitelist management coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure email service and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" defaultValue="smtp.example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" type="number" defaultValue="587" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input id="from-email" type="email" defaultValue="noreply@platform.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input id="from-name" defaultValue="Platform Team" />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featureFlags?.map((flag) => (
                  <div key={flag.key} className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="capitalize">{flag.key.replace(/_/g, ' ')}</Label>
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {flag.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rollout: {flag.rollout_percentage}%
                      </p>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) =>
                        toggleFeatureMutation.mutate({ flagKey: flag.key, enabled: checked })
                      }
                      disabled={toggleFeatureMutation.isPending}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to admins
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack channel
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Critical Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Immediate alerts for critical issues
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
