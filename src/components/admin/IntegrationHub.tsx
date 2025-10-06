import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Calendar, Mail, MessageSquare, Webhook, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function IntegrationHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Fetch integrations
  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  // Fetch calendar syncs
  const { data: calendarSyncs } = useQuery({
    queryKey: ['calendar-sync'],
    queryFn: async () => {
      const { data } = await supabase
        .from('calendar_sync')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  // Fetch webhooks
  const { data: webhooks } = useQuery({
    queryKey: ['webhook-endpoints'],
    queryFn: async () => {
      const { data } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  // Toggle integration
  const toggleIntegration = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({ title: "Integration Updated", description: "Status changed successfully" });
    }
  });

  const availableIntegrations = [
    {
      type: 'stripe',
      name: 'Stripe Connect',
      description: 'Process payments and manage professional payouts',
      icon: CreditCard,
      color: 'text-purple-500',
      features: ['Payment processing', 'Payout management', 'Subscription billing']
    },
    {
      type: 'calendar',
      name: 'Calendar Sync',
      description: 'Sync with Google Calendar and Outlook',
      icon: Calendar,
      color: 'text-blue-500',
      features: ['Two-way sync', 'Automatic updates', 'Conflict detection']
    },
    {
      type: 'email',
      name: 'Email Service',
      description: 'Send transactional emails via SendGrid or Mailgun',
      icon: Mail,
      color: 'text-green-500',
      features: ['Transactional emails', 'Email templates', 'Delivery tracking']
    },
    {
      type: 'sms',
      name: 'SMS Notifications',
      description: 'Send SMS alerts via Twilio',
      icon: MessageSquare,
      color: 'text-orange-500',
      features: ['SMS alerts', 'Two-way messaging', 'Delivery reports']
    },
    {
      type: 'webhook',
      name: 'Webhooks',
      description: 'Connect to external services via webhooks',
      icon: Webhook,
      color: 'text-gray-500',
      features: ['Event-driven', 'Custom endpoints', 'Retry logic']
    }
  ];

  const getIntegrationStatus = (type: string) => {
    const integration = integrations?.find((i: any) => i.integration_type === type);
    return integration?.is_active || false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integration Hub</h2>
        <p className="text-muted-foreground">Connect external services and APIs</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="calendar">Calendar Sync</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableIntegrations.map((integration) => {
              const Icon = integration.icon;
              const isActive = getIntegrationStatus(integration.type);
              
              return (
                <Card key={integration.type}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${integration.color}`} />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      {isActive ? (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {integration.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          variant={isActive ? "outline" : "default"}
                          onClick={() => setSelectedIntegration(integration.type)}
                        >
                          {isActive ? 'Configure' : 'Connect'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure {integration.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>API Key</Label>
                            <Input placeholder="Enter your API key" type="password" />
                          </div>
                          <div>
                            <Label>Webhook URL (optional)</Label>
                            <Input placeholder="https://your-app.com/webhooks" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Enable Integration</Label>
                            <Switch defaultChecked={isActive} />
                          </div>
                          <Button className="w-full">Save Configuration</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Synchronization</CardTitle>
              <CardDescription>Connected calendars and sync status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {calendarSyncs?.map((sync: any) => (
                <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium capitalize">{sync.provider} Calendar</p>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {sync.last_sync_at ? new Date(sync.last_sync_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={sync.sync_status === 'active' ? 'secondary' : 'destructive'}>
                    {sync.sync_status}
                  </Badge>
                </div>
              ))}
              {calendarSyncs?.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No calendars connected</p>
                  <Button className="mt-4" variant="outline">
                    Connect Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>Manage webhook integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhooks?.map((webhook: any) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Webhook className="h-4 w-4" />
                      <p className="font-medium">{webhook.url}</p>
                    </div>
                    <div className="flex gap-2">
                      {webhook.events?.map((event: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={webhook.is_active ? 'secondary' : 'outline'}>
                    {webhook.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {webhooks?.length === 0 && (
                <div className="text-center py-8">
                  <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No webhooks configured</p>
                  <Button className="mt-4" variant="outline">
                    Add Webhook
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
