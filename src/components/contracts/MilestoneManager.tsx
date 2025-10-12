import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MilestoneManagerProps {
  contractId: string;
  milestones: any[];
  isClient: boolean;
  isProfessional: boolean;
}

const statusIcons = {
  pending: Clock,
  completed: CheckCircle,
  released: CheckCircle,
  disputed: XCircle,
};

const statusColors = {
  pending: 'bg-yellow-500',
  completed: 'bg-blue-500',
  released: 'bg-green-500',
  disputed: 'bg-red-500',
};

export function MilestoneManager({ contractId, milestones, isClient, isProfessional }: MilestoneManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const updateMilestone = useMutation({
    mutationFn: async ({ milestoneId, status }: { milestoneId: string; status: string }) => {
      const { error } = await supabase
        .from('escrow_milestones')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', milestoneId);

      if (error) throw error;

      // Create activity log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('activity_feed').insert({
        user_id: user?.id,
        event_type: status === 'released' ? 'milestone_released' : 'milestone_completed',
        entity_type: 'milestone',
        entity_id: milestoneId,
        title: `Milestone ${status}`,
        description: notes || `Milestone status updated to ${status}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      toast({ title: 'Milestone updated successfully' });
      setIsDialogOpen(false);
      setNotes('');
      setSelectedMilestone(null);
    },
    onError: () => {
      toast({ title: 'Failed to update milestone', variant: 'destructive' });
    },
  });

  const handleMilestoneAction = (milestone: any, action: string) => {
    setSelectedMilestone(milestone);
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedMilestone) return;

    let newStatus = selectedMilestone.status;
    if (isProfessional && selectedMilestone.status === 'pending') {
      newStatus = 'completed';
    } else if (isClient && selectedMilestone.status === 'completed') {
      newStatus = 'released';
    }

    updateMilestone.mutate({
      milestoneId: selectedMilestone.id,
      status: newStatus,
    });
  };

  return (
    <>
      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const StatusIcon = statusIcons[milestone.status as keyof typeof statusIcons];
          const canComplete = isProfessional && milestone.status === 'pending';
          const canRelease = isClient && milestone.status === 'completed';

          return (
            <Card key={milestone.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <StatusIcon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Milestone {idx + 1}</h4>
                      <Badge className={statusColors[milestone.status as keyof typeof statusColors]}>
                        {milestone.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    {milestone.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {formatDistanceToNow(new Date(milestone.due_date))} from now
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold">€{milestone.amount}</p>
                    <p className="text-xs text-muted-foreground">{milestone.currency}</p>
                  </div>

                  {canComplete && (
                    <Button
                      size="sm"
                      onClick={() => handleMilestoneAction(milestone, 'complete')}
                    >
                      Mark Complete
                    </Button>
                  )}

                  {canRelease && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMilestoneAction(milestone, 'release')}
                    >
                      Release Payment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isProfessional ? 'Mark Milestone Complete' : 'Release Payment'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedMilestone?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Amount: €{selectedMilestone?.amount}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isProfessional
                    ? 'Describe the completed work...'
                    : 'Confirm the work meets your requirements...'
                }
                rows={4}
              />
            </div>

            {isProfessional && (
              <p className="text-sm text-muted-foreground">
                The client will be notified and can review the work before releasing payment.
              </p>
            )}

            {isClient && (
              <p className="text-sm text-muted-foreground">
                This will release the payment to the professional. This action cannot be undone.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={updateMilestone.isPending}>
              {updateMilestone.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
