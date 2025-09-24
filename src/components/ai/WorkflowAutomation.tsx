import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Play, Pause, Settings, Plus, Trash2, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: any;
  order: number;
}

interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  workflow_steps: WorkflowStep[];
  is_active: boolean;
  execution_history: any[];
  created_at: string;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  trigger_conditions: any;
  actions: any[];
  is_active: boolean;
  execution_count: number;
  success_rate: number;
}

export const WorkflowAutomation = () => {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowAutomation[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const { toast } = useToast();

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_type: 'job_created',
    trigger_config: {},
    steps: []
  });

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    rule_type: 'notification',
    trigger_conditions: {},
    actions: []
  });

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      setLoading(true);

      // Load workflows
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;

      // Load automation rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('ai_automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      setWorkflows((workflowData || []).map(workflow => ({
        ...workflow,
        workflow_steps: Array.isArray(workflow.workflow_steps) ? workflow.workflow_steps : [],
        execution_history: Array.isArray(workflow.execution_history) ? workflow.execution_history : [],
        trigger_config: typeof workflow.trigger_config === 'object' ? workflow.trigger_config : {}
      })));
      setAutomationRules((rulesData || []).map(rule => ({
        ...rule,
        actions: Array.isArray(rule.actions) ? rule.actions : [],
        trigger_conditions: typeof rule.trigger_conditions === 'object' ? rule.trigger_conditions : {}
      })));

    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Error loading automations",
        description: "Failed to load workflow and automation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_automations')
        .insert([{
          name: newWorkflow.name,
          description: newWorkflow.description,
          trigger_type: newWorkflow.trigger_type,
          trigger_config: newWorkflow.trigger_config,
          workflow_steps: newWorkflow.steps,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => [{
        ...data,
        workflow_steps: Array.isArray(data.workflow_steps) ? data.workflow_steps : [],
        execution_history: Array.isArray(data.execution_history) ? data.execution_history : [],
        trigger_config: typeof data.trigger_config === 'object' ? data.trigger_config : {}
      }, ...prev]);
      setShowCreateWorkflow(false);
      setNewWorkflow({
        name: '',
        description: '',
        trigger_type: 'job_created',
        trigger_config: {},
        steps: []
      });

      toast({
        title: "Workflow created",
        description: "New automation workflow has been created successfully"
      });

    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error creating workflow",
        description: "Failed to create automation workflow",
        variant: "destructive"
      });
    }
  };

  const createAutomationRule = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_automation_rules')
        .insert([{
          name: newRule.name,
          description: newRule.description,
          rule_type: newRule.rule_type,
          trigger_conditions: newRule.trigger_conditions,
          actions: newRule.actions,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setAutomationRules(prev => [{
        ...data,
        actions: Array.isArray(data.actions) ? data.actions : [],
        trigger_conditions: typeof data.trigger_conditions === 'object' ? data.trigger_conditions : {}
      }, ...prev]);
      setShowCreateRule(false);
      setNewRule({
        name: '',
        description: '',
        rule_type: 'notification',
        trigger_conditions: {},
        actions: []
      });

      toast({
        title: "Automation rule created",
        description: "New automation rule has been created successfully"
      });

    } catch (error) {
      console.error('Error creating automation rule:', error);
      toast({
        title: "Error creating rule",
        description: "Failed to create automation rule",
        variant: "destructive"
      });
    }
  };

  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_automations')
        .update({ is_active: isActive })
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId ? { ...workflow, is_active: isActive } : workflow
      ));

      toast({
        title: isActive ? "Workflow activated" : "Workflow deactivated",
        description: `Workflow has been ${isActive ? 'activated' : 'deactivated'}`
      });

    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast({
        title: "Error updating workflow",
        description: "Failed to update workflow status",
        variant: "destructive"
      });
    }
  };

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setAutomationRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));

      toast({
        title: isActive ? "Rule activated" : "Rule deactivated",
        description: `Automation rule has been ${isActive ? 'activated' : 'deactivated'}`
      });

    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Error updating rule",
        description: "Failed to update rule status",
        variant: "destructive"
      });
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'job_created': return <Plus className="w-4 h-4" />;
      case 'job_completed': return <CheckCircle className="w-4 h-4" />;
      case 'payment_received': return <CheckCircle className="w-4 h-4" />;
      case 'schedule': return <Clock className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
            <Zap className="w-6 h-6" />
            Workflow Automation
          </h2>
          <p className="text-muted-foreground">Automate business processes and workflows</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateRule(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
          <Button onClick={() => setShowCreateWorkflow(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules ({automationRules.length})</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <div className="space-y-4">
            {showCreateWorkflow && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Workflow</CardTitle>
                  <CardDescription>Define an automated workflow process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <Input
                        id="workflow-name"
                        value={newWorkflow.name}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Job Completion Follow-up"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trigger-type">Trigger Event</Label>
                      <Select value={newWorkflow.trigger_type} onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, trigger_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job_created">Job Created</SelectItem>
                          <SelectItem value="job_completed">Job Completed</SelectItem>
                          <SelectItem value="payment_received">Payment Received</SelectItem>
                          <SelectItem value="schedule">Scheduled Time</SelectItem>
                          <SelectItem value="user_signup">User Signup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Textarea
                      id="workflow-description"
                      value={newWorkflow.description}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this workflow does..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createWorkflow}>Create Workflow</Button>
                    <Button variant="outline" onClick={() => setShowCreateWorkflow(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {getTriggerIcon(workflow.trigger_type)}
                      <div>
                        <CardTitle>{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{workflow.trigger_type}</Badge>
                          <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div>Executions: {workflow.execution_history?.length || 0}</div>
                        <div className="text-muted-foreground">
                          Last: {workflow.execution_history?.[0] ? 
                            new Date(workflow.execution_history[0].timestamp).toLocaleDateString() : 
                            'Never'
                          }
                        </div>
                      </div>
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {workflow.workflow_steps && workflow.workflow_steps.length > 0 && (
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Steps:</span>
                      {workflow.workflow_steps.map((step: any, index: number) => (
                        <React.Fragment key={step.id || index}>
                          <Badge variant="outline" className="text-xs">
                            {step.name || step.type}
                          </Badge>
                          {index < workflow.workflow_steps.length - 1 && <ArrowRight className="w-3 h-3" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <div className="space-y-4">
            {showCreateRule && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Automation Rule</CardTitle>
                  <CardDescription>Define conditions and actions for automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input
                        id="rule-name"
                        value={newRule.name}
                        onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Low Rating Alert"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rule-type">Rule Type</Label>
                      <Select value={newRule.rule_type} onValueChange={(value) => setNewRule(prev => ({ ...prev, rule_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notification">Send Notification</SelectItem>
                          <SelectItem value="assignment">Auto Assignment</SelectItem>
                          <SelectItem value="escalation">Escalation</SelectItem>
                          <SelectItem value="data_update">Update Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rule-description">Description</Label>
                    <Textarea
                      id="rule-description"
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this rule does..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createAutomationRule}>Create Rule</Button>
                    <Button variant="outline" onClick={() => setShowCreateRule(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {automationRules.map((rule) => (
              <Card key={rule.id} className="hover-scale">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{rule.rule_type}</Badge>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div>Executions: {rule.execution_count}</div>
                        <div className={`font-medium ${getSuccessRateColor(rule.success_rate)}`}>
                          Success: {rule.success_rate}%
                        </div>
                      </div>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleAutomationRule(rule.id, checked)}
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
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Execution History</h3>
            <p className="text-muted-foreground">
              Detailed execution logs and performance metrics will be displayed here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};