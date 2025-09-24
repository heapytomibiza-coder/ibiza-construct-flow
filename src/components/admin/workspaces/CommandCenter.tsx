import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
// import { supabase } from '@/integrations/supabase/client'; // TODO: uncomment when wiring

/** ---------- Types ---------- */

export type WorkflowTrigger =
  | 'job_created'
  | 'job_completed'
  | 'monthly_schedule'
  | 'daily_schedule'
  | 'hourly_schedule';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'includes'
  | 'exists';

export type ActionType =
  | 'assign_professional'
  | 'send_payment_reminder'
  | 'generate_performance_report'
  | 'broadcast_alert';

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean | string[] | number[];
}

export type WorkflowAction =
  | { type: 'assign_professional'; criteria: 'best_match' | 'nearest' | 'highest_rated' }
  | { type: 'send_payment_reminder'; delay: '24_hours' | '48_hours' | '72_hours' }
  | { type: 'generate_performance_report'; recipients: string[] }
  | { type: 'broadcast_alert'; channels: Array<'sms' | 'push' | 'email'> };

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active: boolean;
  execution_count: number;
  /** 0–100 percentage */
  success_rate: number;
  last_executed: string; // ISO
}

interface AutomationMetrics {
  total_workflows: number;
  active_workflows: number;
  executions_today: number;
  success_rate: number; // 0–100
  time_saved_hours: number;
}

/** ---------- Utils ---------- */

const fmtDate = (iso: string) => {
  // Europe/Madrid per your project context
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(d);
};

const humanize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

/** ---------- Component ---------- */

export const CommandCenter: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  /** Loaders (mocked now; wire to Supabase later) */
  useEffect(() => {
    const load = async () => {
      try {
        // TODO: Replace with Supabase queries (tables: automation_workflows, automation_metrics_view)
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
            last_executed: '2025-09-22T10:30:00.000Z',
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
            last_executed: '2025-09-24T09:15:00.000Z',
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
            last_executed: '2025-09-01T00:00:00.000Z',
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
            last_executed: '2025-09-20T16:45:00.000Z',
          },
        ];

        const mockMetrics: AutomationMetrics = {
          total_workflows: mockWorkflows.length,
          active_workflows: mockWorkflows.filter((w) => w.is_active).length,
          executions_today: 47,
          success_rate: 91.2,
          time_saved_hours: 127.5,
        };

        setWorkflows(mockWorkflows);
        setMetrics(mockMetrics);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load Command Center');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** Optimistic mutations with rollback */
  const toggleWorkflow = useCallback(async (workflowId: string) => {
    const prev = workflows;
    const next = prev.map((w) =>
      w.id === workflowId ? { ...w, is_active: !w.is_active } : w
    );
    setWorkflows(next);
    toast.success(`Workflow ${next.find((w) => w.id === workflowId)?.is_active ? 'activated' : 'deactivated'}`);

    try {
      // TODO: Persist via Supabase:
      // const { error } = await supabase.from('automation_workflows')
      //   .update({ is_active: nextState }).eq('id', workflowId);
      // if (error) throw error;
    } catch (e) {
      console.error(e);
      setWorkflows(prev); // rollback
      toast.error('Failed to update workflow');
    }
  }, [workflows]);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    const prev = workflows;
    const next = prev.map((w) =>
      w.id === workflowId
        ? { ...w, execution_count: w.execution_count + 1, last_executed: new Date().toISOString() }
        : w
    );
    setWorkflows(next);
    toast.success('Workflow execution initiated');

    try {
      // TODO: RPC call to edge function that runs the workflow server-side
      // const { data, error } = await supabase.functions.invoke('run-workflow', { body: { workflowId } });
      // if (error) throw error;
    } catch (e) {
      console.error(e);
      setWorkflows(prev); // rollback
      toast.error('Failed to execute workflow');
    }
  }, [workflows]);

  const activeCount = useMemo(() => workflows.filter((w) => w.is_active).length, [workflows]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}><CardContent className="p-6 h-24" /></Card>
          ))}
        </div>
        <Card><CardContent className="p-6 h-48 animate-pulse" /></Card>
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
        <Button aria-label="Open configuration">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

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
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
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
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{metrics.success_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                  <p className="text-2xl font-bold">{metrics.time_saved_hours.toFixed(1)}h</p>
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
            {workflows.map((workflow) => {
              const percent = Math.max(0, Math.min(100, workflow.success_rate));
              return (
                <Card key={workflow.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => executeWorkflow(workflow.id)}
                          disabled={!workflow.is_active}
                          aria-disabled={!workflow.is_active}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Execute
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleWorkflow(workflow.id)}
                        >
                          {workflow.is_active ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Trigger</p>
                        <p className="font-medium">{humanize(workflow.trigger)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Executions</p>
                        <p className="font-medium">{workflow.execution_count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={percent} className="flex-1" />
                          <span className="text-sm font-medium">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Executed</p>
                        <p className="font-medium">{fmtDate(workflow.last_executed)}</p>
                      </div>
                    </div>
                    {/* Optional: Show conditions/actions preview */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg border">
                        <p className="mb-1 font-semibold">Conditions</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {workflow.conditions.map((c, i) => (
                            <li key={i}>
                              <span className="font-medium">{c.field}</span> {c.operator}{' '}
                              {c.value !== undefined ? <code className="text-xs">{String(c.value)}</code> : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="mb-1 font-semibold">Actions</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {workflow.actions.map((a, i) => (
                            <li key={i}>
                              <span className="font-medium">{humanize(a.type)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Professional Matching</h3>
                    <p className="text-sm text-muted-foreground">AI-powered professional assignment</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Route Optimization</h3>
                    <p className="text-sm text-muted-foreground">Minimize travel time and costs</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
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