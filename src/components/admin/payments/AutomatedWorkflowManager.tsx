import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Zap, Clock, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkflowRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  conditions: any;
  actions: any;
}

export const AutomatedWorkflowManager = () => {
  const queryClient = useQueryClient();
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['payment-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_automation_rules')
        .select('*')
        .eq('rule_type', 'payment')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const toggleWorkflow = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('ai_automation_rules')
        .update({ is_active: enabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-workflows'] });
      toast.success('Workflow updated');
    },
    onError: () => {
      toast.error('Failed to update workflow');
    },
  });

  const createDefaultWorkflows = useMutation({
    mutationFn: async () => {
      const defaultWorkflows = [
        {
          name: 'Auto-approve small refunds',
          description: 'Automatically approve refund requests under $50',
          rule_type: 'payment',
          trigger_conditions: { refund_amount: { less_than: 50 } },
          actions: { auto_approve: true, send_notification: true },
        },
        {
          name: 'Flag large transactions',
          description: 'Review transactions over $1000',
          rule_type: 'payment',
          trigger_conditions: { amount: { greater_than: 1000 } },
          actions: { flag_for_review: true, notify_admin: true },
        },
        {
          name: 'Auto-release completed jobs',
          description: 'Release escrow when job is completed',
          rule_type: 'payment',
          trigger_conditions: { job_status: 'completed' },
          actions: { release_escrow: true, generate_invoice: true },
        },
      ];

      for (const workflow of defaultWorkflows) {
        await supabase.from('ai_automation_rules').insert(workflow);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-workflows'] });
      toast.success('Default workflows created');
    },
  });

  if (isLoading) {
    return <div>Loading workflows...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automated Workflows
              </CardTitle>
              <CardDescription>Manage payment automation rules</CardDescription>
            </div>
            <Button onClick={() => createDefaultWorkflows.mutate()} size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Create Default Workflows
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflows?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No workflows configured. Click "Create Default Workflows" to get started.
            </div>
          ) : (
            workflows?.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        {workflow.is_active && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Executed: {workflow.execution_count || 0} times
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Success Rate: {(workflow.success_rate || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={workflow.is_active}
                      onCheckedChange={(checked) =>
                        toggleWorkflow.mutate({ id: workflow.id, enabled: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
