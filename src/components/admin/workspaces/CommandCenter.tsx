import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Settings, 
  Zap, 
  Clock, 
  Users, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  execution_count: number;
  success_rate: number;
  last_executed: string;
}

interface AutomationMetrics {
  total_workflows: number;
  active_workflows: number;
  executions_today: number;
  success_rate: number;
  time_saved_hours: number;
}

export const CommandCenter = () => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);

  useEffect(() => {
    loadWorkflows();
    loadMetrics();
  }, []);

  const loadWorkflows = async () => {
    try {
      // Mock workflow data - in real implementation, this would come from database
      const mockWorkflows: WorkflowRule[] = [
        {
          id: '1',
          name: 'Auto-assign High Priority Jobs',
          trigger: 'job_created',
          conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
          actions: [{ type: 'assign_professional', criteria: 'best_match' }],
          is_active: true,
          execution_count: 245,
          success_rate: 94.2,
          last_executed: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Payment Reminder Automation',
          trigger: 'job_completed',
          conditions: [{ field: 'payment_status', operator: 'equals', value: 'pending' }],
          actions: [{ type: 'send_payment_reminder', delay: '24_hours' }],
          is_active: true,
          execution_count: 158,
          success_rate: 87.3,
          last_executed: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          name: 'Professional Performance Review',
          trigger: 'monthly_schedule',
          conditions: [{ field: 'jobs_completed', operator: 'greater_than', value: 10 }],
          actions: [{ type: 'generate_performance_report', recipients: ['admin'] }],
          is_active: true,
          execution_count: 12,
          success_rate: 100,
          last_executed: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: 'Emergency Job Alert System',
          trigger: 'job_created',
          conditions: [{ field: 'urgency', operator: 'equals', value: 'emergency' }],
          actions: [{ type: 'broadcast_alert', channels: ['sms', 'push', 'email'] }],
          is_active: false,
          execution_count: 8,
          success_rate: 62.5,
          last_executed: '2024-01-10T16:45:00Z'
        }
      ];

      setWorkflows(mockWorkflows);
      setLoading(false);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflow data');
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Mock metrics data
      const mockMetrics: AutomationMetrics = {
        total_workflows: 4,
        active_workflows: 3,
        executions_today: 47,
        success_rate: 91.2,
        time_saved_hours: 127.5
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      setWorkflows(prev => 
        prev.map(w => 
          w.id === workflowId ? { ...w, is_active: !isActive } : w
        )
      );
      toast.success(`Workflow ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      toast.success('Workflow execution initiated');
      // Mock execution - update execution count
      setWorkflows(prev => 
        prev.map(w => 
          w.id === workflowId 
            ? { 
                ...w, 
                execution_count: w.execution_count + 1,
                last_executed: new Date().toISOString()
              } 
            : w
        )
      );
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Command Center...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Command Center</h2>
          <p className="text-muted-foreground">Automated workflow management and system control</p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Automation Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                  <p className="text-2xl font-bold">{metrics.total_workflows}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{metrics.active_workflows}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Executions Today</p>
                  <p className="text-2xl font-bold">{metrics.executions_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{metrics.success_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                  <p className="text-2xl font-bold">{metrics.time_saved_hours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="scheduler">Smart Scheduler</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={!workflow.is_active}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Execute
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                      >
                        {workflow.is_active ? (
                          <Pause className="w-4 h-4 mr-1" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        {workflow.is_active ? "Pause" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Trigger</p>
                      <p className="font-medium">{workflow.trigger.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Executions</p>
                      <p className="font-medium">{workflow.execution_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={workflow.success_rate} className="flex-1" />
                        <span className="text-sm font-medium">{workflow.success_rate}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Executed</p>
                      <p className="font-medium">
                        {new Date(workflow.last_executed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Scheduling Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Professional Matching</h3>
                    <p className="text-sm text-muted-foreground">AI-powered professional assignment</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold">Route Optimization</h3>
                    <p className="text-sm text-muted-foreground">Minimize travel time and costs</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold">Dynamic Scheduling</h3>
                    <p className="text-sm text-muted-foreground">Real-time schedule adjustments</p>
                  </div>
                </div>
                <Button className="w-full">Configure Scheduling Rules</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Payment Gateway</h3>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Stripe payment processing</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">SMS Service</h3>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Twilio SMS notifications</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Calendar Sync</h3>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Google Calendar integration</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Email Service</h3>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">SendGrid email delivery</p>
                  </div>
                </div>
                <Button className="w-full">Manage Integrations</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};