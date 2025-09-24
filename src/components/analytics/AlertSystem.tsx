import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bell, BellRing, Settings, Plus, Trash2, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric_name: string;
  condition_type: string;
  threshold_value: number;
  comparison_operator: string;
  is_active: boolean;
  notification_channels: string[];
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  alert_type: string;
  created_at: string;
  resolved_at?: string;
  acknowledged_at?: string;
}

export const AlertSystem = () => {
  const [loading, setLoading] = useState(true);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    metric_name: 'revenue',
    condition_type: 'threshold',
    threshold_value: 0,
    comparison_operator: 'greater_than',
    notification_channels: ['email']
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAlertData();
  }, []);

  const loadAlertData = async () => {
    try {
      setLoading(true);

      // Load alert rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      // Load active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('ai_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;

      setAlertRules((rulesData || []).map(rule => ({
        ...rule,
        notification_channels: Array.isArray(rule.notification_channels) 
          ? rule.notification_channels.map(String) 
          : []
      })));
      setActiveAlerts((alertsData || []).map(alert => ({
        ...alert,
        severity: (alert.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        status: (alert.status as 'active' | 'resolved' | 'acknowledged') || 'active'
      })));

    } catch (error) {
      console.error('Error loading alert data:', error);
      toast({
        title: "Error loading alerts",
        description: "Failed to load alert rules and notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlertRule = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert([{
          name: newRule.name,
          description: newRule.description,
          metric_name: newRule.metric_name,
          condition_type: newRule.condition_type,
          threshold_value: newRule.threshold_value,
          comparison_operator: newRule.comparison_operator,
          notification_channels: newRule.notification_channels,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setAlertRules(prev => [data, ...prev]);
      setShowCreateRule(false);
      setNewRule({
        name: '',
        description: '',
        metric_name: 'revenue',
        condition_type: 'threshold',
        threshold_value: 0,
        comparison_operator: 'greater_than',
        notification_channels: ['email']
      });

      toast({
        title: "Alert rule created",
        description: "New alert rule has been created successfully"
      });

    } catch (error) {
      console.error('Error creating alert rule:', error);
      toast({
        title: "Error creating alert rule",
        description: "Failed to create alert rule",
        variant: "destructive"
      });
    }
  };

  const toggleAlertRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setAlertRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));

      toast({
        title: isActive ? "Alert rule enabled" : "Alert rule disabled",
        description: `Alert rule has been ${isActive ? 'enabled' : 'disabled'}`
      });

    } catch (error) {
      console.error('Error toggling alert rule:', error);
      toast({
        title: "Error updating alert rule",
        description: "Failed to update alert rule status",
        variant: "destructive"
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('ai_alerts')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setActiveAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged', acknowledged_at: new Date().toISOString() }
          : alert
      ));

      toast({
        title: "Alert acknowledged",
        description: "Alert has been acknowledged"
      });

    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error acknowledging alert",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('ai_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setActiveAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved', resolved_at: new Date().toISOString() }
          : alert
      ));

      toast({
        title: "Alert resolved",
        description: "Alert has been marked as resolved"
      });

    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error resolving alert",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium': return <Bell className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="w-6 h-6" />
            Alert System
          </h2>
          <p className="text-muted-foreground">Manage business alerts and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowCreateRule(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active alerts at this time</p>
                </CardContent>
              </Card>
            ) : (
              activeAlerts.map((alert) => (
                <Card key={alert.id} className="hover-scale">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'default' : 'secondary'
                            }>
                              {alert.severity}
                            </Badge>
                            <Badge variant={
                              alert.status === 'resolved' ? 'default' :
                              alert.status === 'acknowledged' ? 'secondary' : 'outline'
                            }>
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                              Acknowledge
                            </Button>
                            <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <div className="space-y-4">
            {showCreateRule && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Alert Rule</CardTitle>
                  <CardDescription>Define conditions that trigger alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ruleName">Rule Name</Label>
                      <Input
                        id="ruleName"
                        value={newRule.name}
                        onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Low Revenue Alert"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metric">Metric</Label>
                      <Select value={newRule.metric_name} onValueChange={(value) => setNewRule(prev => ({ ...prev, metric_name: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="jobs">Job Count</SelectItem>
                          <SelectItem value="users">User Count</SelectItem>
                          <SelectItem value="completion_rate">Completion Rate</SelectItem>
                          <SelectItem value="response_time">Response Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operator">Condition</Label>
                      <Select value={newRule.comparison_operator} onValueChange={(value) => setNewRule(prev => ({ ...prev, comparison_operator: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greater_than">Greater than</SelectItem>
                          <SelectItem value="less_than">Less than</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not equals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="threshold">Threshold Value</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={newRule.threshold_value}
                        onChange={(e) => setNewRule(prev => ({ ...prev, threshold_value: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createAlertRule}>Create Rule</Button>
                    <Button variant="outline" onClick={() => setShowCreateRule(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {alertRules.map((rule) => (
              <Card key={rule.id} className="hover-scale">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rule.name}</h4>
                        {rule.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rule.metric_name} {rule.comparison_operator.replace('_', ' ')} {rule.threshold_value}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleAlertRule(rule.id, checked)}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Alert History</h3>
            <p className="text-muted-foreground">
              Historical alert data will be displayed here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};