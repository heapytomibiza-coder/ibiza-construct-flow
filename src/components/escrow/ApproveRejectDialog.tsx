import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEscrowMilestones } from '@/hooks/useEscrowMilestones';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApproveRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
  contractId: string;
}

export const ApproveRejectDialog = ({
  open,
  onOpenChange,
  milestoneId,
  contractId,
}: ApproveRejectDialogProps) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { approveMilestone, rejectMilestone, refetch } = useEscrowMilestones(contractId);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveMilestone(milestoneId);
      refetch();
      onOpenChange(false);
      setAction(null);
    } catch (error) {
      console.error('Error approving milestone:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    try {
      setProcessing(true);
      await rejectMilestone(milestoneId, rejectionReason);
      refetch();
      onOpenChange(false);
      setAction(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting milestone:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Milestone</DialogTitle>
          <DialogDescription>
            Approve the milestone to trigger payment release, or reject with feedback
          </DialogDescription>
        </DialogHeader>

        {!action ? (
          <div className="space-y-4">
            <Button
              className="w-full justify-start bg-gradient-hero"
              size="lg"
              onClick={() => setAction('approve')}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approve Milestone
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
              onClick={() => setAction('reject')}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Reject Milestone
            </Button>
          </div>
        ) : action === 'approve' ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                Approving this milestone will mark it as completed and trigger the escrow release process.
                The professional will receive payment once you release the funds.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAction(null)} disabled={processing}>
                Back
              </Button>
              <Button onClick={handleApprove} disabled={processing} className="bg-gradient-hero">
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what needs to be improved or corrected..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAction(null)} disabled={processing}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
