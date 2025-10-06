import React, { useState } from 'react';
import { useEscrow } from '@/hooks/useEscrow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  DollarSign,
  Loader2,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface EnhancedEscrowTimelineProps {
  jobId: string;
  isClient?: boolean;
}

export const EnhancedEscrowTimeline: React.FC<EnhancedEscrowTimelineProps> = ({
  jobId,
  isClient = false
}) => {
  const { milestones, loading, releaseMilestone, progress } = useEscrow(jobId);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releasing, setReleasing] = useState(false);

  const handleRelease = async () => {
    if (!selectedMilestone) return;

    setReleasing(true);
    try {
      await releaseMilestone(selectedMilestone);
      toast.success('Funds released successfully');
      setSelectedMilestone(null);
      setReleaseNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to release funds');
    } finally {
      setReleasing(false);
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Escrow Milestones</h3>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="font-semibold">
                {progress.completed} / {progress.total} Completed
              </p>
            </div>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>${progress.completedAmount.toFixed(2)} released</span>
            <span>${progress.remainingAmount.toFixed(2)} remaining</span>
          </div>
        </div>

        {milestones.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No milestones configured
          </p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const isCompleted = milestone.status === 'completed';
              const isPending = milestone.status === 'pending';

              return (
                <Card
                  key={milestone.id}
                  className={`p-4 ${isCompleted ? 'border-green-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {getMilestoneIcon(milestone.status)}
                      {index < milestones.length - 1 && (
                        <div className={`absolute left-3 top-8 w-0.5 h-12 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <Badge variant={isCompleted ? 'default' : 'secondary'}>
                              Milestone {milestone.milestone_number}
                            </Badge>
                          </div>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ${milestone.amount.toFixed(2)}
                          </p>
                          {isCompleted ? (
                            <Badge className="bg-green-500">
                              <Unlock className="h-3 w-3 mr-1" />
                              Released
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500">
                              <Lock className="h-3 w-3 mr-1" />
                              Held
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        {milestone.due_date && (
                          <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                        )}
                        {milestone.completed_date && (
                          <span>Completed: {format(new Date(milestone.completed_date), 'MMM dd, yyyy')}</span>
                        )}
                      </div>

                      {isClient && isPending && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => setSelectedMilestone(milestone.id)}
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          Release Funds
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <Card className="mt-6 p-4 bg-muted">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Escrow</p>
              <p className="text-2xl font-bold">${progress.totalAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${progress.remainingAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </Card>

      {/* Release Confirmation Dialog */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Escrow Funds</DialogTitle>
            <DialogDescription>
              You are about to release funds to the professional. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="Add any notes about this release..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedMilestone(null)}
              disabled={releasing}
            >
              Cancel
            </Button>
            <Button onClick={handleRelease} disabled={releasing}>
              {releasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Releasing...
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Confirm Release
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
