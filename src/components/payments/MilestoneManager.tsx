import { useState } from 'react';
import { useEscrow, EscrowMilestone } from '@/hooks/useEscrow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface MilestoneManagerProps {
  contractId: string;
  isClient: boolean;
}

export const MilestoneManager = ({ contractId, isClient }: MilestoneManagerProps) => {
  const { milestones, progress, createMilestone, approveMilestone, rejectMilestone, releaseEscrow } = useEscrow(contractId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: 0,
    due_date: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'released':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      released: 'default',
      disputed: 'destructive',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const handleCreateMilestone = async () => {
    if (!milestones) return;
    
    await createMilestone({
      contract_id: contractId,
      title: newMilestone.title,
      description: newMilestone.description,
      amount: newMilestone.amount,
      milestone_number: milestones.length + 1,
      status: 'pending',
      due_date: newMilestone.due_date || undefined,
      deliverables: [],
      metadata: {},
    });
    
    setShowCreateDialog(false);
    setNewMilestone({ title: '', description: '', amount: 0, due_date: '' });
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Escrow Progress</CardTitle>
            <CardDescription>
              {progress.completed} of {progress.total} milestones completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress.percentage} />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${progress.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Released</p>
                <p className="text-2xl font-bold text-success">${progress.completedAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-muted-foreground">${progress.remainingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones List */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
              <DialogDescription>Add a new milestone to the contract</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newMilestone.amount}
                  onChange={(e) => setNewMilestone({ ...newMilestone, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newMilestone.due_date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateMilestone}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {milestones?.map((milestone) => (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(milestone.status)}
                    {milestone.title}
                  </CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </div>
                <div className="text-right space-y-2">
                  {getStatusBadge(milestone.status)}
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <DollarSign className="w-4 h-4" />
                    {milestone.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestone.due_date && (
                  <div className="text-sm text-muted-foreground">
                    Due: {format(new Date(milestone.due_date), 'PPP')}
                  </div>
                )}
                
                {milestone.auto_release_date && milestone.status === 'completed' && (
                  <div className="text-sm text-warning">
                    Auto-release on: {format(new Date(milestone.auto_release_date), 'PPP')}
                  </div>
                )}

                {milestone.rejection_reason && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    Rejection reason: {milestone.rejection_reason}
                  </div>
                )}

                {isClient && milestone.status === 'in_progress' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMilestone(milestone.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Milestone</DialogTitle>
                          <DialogDescription>Please provide a reason for rejection</DialogDescription>
                        </DialogHeader>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                        />
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              rejectMilestone(milestone.id, rejectionReason);
                              setRejectionReason('');
                            }}
                          >
                            Confirm Rejection
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {isClient && milestone.status === 'completed' && (
                  <Button
                    size="sm"
                    onClick={() => releaseEscrow(milestone.id)}
                  >
                    Release Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
