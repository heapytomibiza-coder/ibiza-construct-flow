import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar,
  FileText,
  User,
  AlertCircle
} from "lucide-react";

interface MilestoneDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: any;
  userRole: 'client' | 'professional';
  onApprove?: () => void;
  onReject?: () => void;
  onRelease?: () => void;
}

export const MilestoneDetailsDialog = ({
  open,
  onOpenChange,
  milestone,
  userRole,
  onApprove,
  onReject,
  onRelease,
}: MilestoneDetailsDialogProps) => {
  if (!milestone) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'released':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const showApprovalActions = 
    userRole === 'client' && 
    milestone.status === 'completed' &&
    !milestone.approved_at;

  const showReleaseAction = 
    userRole === 'client' && 
    milestone.status === 'completed' &&
    milestone.approved_at &&
    !milestone.released_at;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Milestone Details</DialogTitle>
            <Badge variant={getStatusColor(milestone.status)}>
              {milestone.status.replace('_', ' ')}
            </Badge>
          </div>
          <DialogDescription>
            Milestone #{milestone.milestone_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
            {milestone.description && (
              <p className="text-muted-foreground">{milestone.description}</p>
            )}
          </div>

          <Separator />

          {/* Amount & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">${milestone.amount.toFixed(2)}</p>
              </div>
            </div>

            {milestone.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-semibold">
                    {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {milestone.completed_date && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="font-semibold">
                    {format(new Date(milestone.completed_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {milestone.auto_release_date && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Auto-Release</p>
                  <p className="font-semibold text-warning">
                    {format(new Date(milestone.auto_release_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submission Notes */}
          {milestone.submission_notes && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h4 className="font-semibold">Submission Notes</h4>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {milestone.submission_notes}
                </p>
                {milestone.submitted_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {format(new Date(milestone.submitted_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Approval Info */}
          {milestone.approved_at && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-success" />
                  <h4 className="font-semibold text-success">Approved</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Approved on {format(new Date(milestone.approved_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </>
          )}

          {/* Rejection Info */}
          {milestone.rejected_at && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <h4 className="font-semibold text-destructive">Rejected</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Rejected on {format(new Date(milestone.rejected_at), 'MMM dd, yyyy HH:mm')}
                </p>
                {milestone.rejection_reason && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm">{milestone.rejection_reason}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Auto-release warning */}
          {milestone.approval_deadline && 
           milestone.status === 'completed' &&
           !milestone.approved_at &&
           new Date(milestone.approval_deadline) < new Date() && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-semibold text-warning mb-1">
                    Approval Deadline Passed
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This milestone will be automatically released on{' '}
                    {format(new Date(milestone.auto_release_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(showApprovalActions || showReleaseAction) && (
            <>
              <Separator />
              <div className="flex gap-3">
                {showApprovalActions && (
                  <>
                    <Button onClick={onApprove} className="flex-1">
                      Approve Milestone
                    </Button>
                    <Button onClick={onReject} variant="outline" className="flex-1">
                      Request Changes
                    </Button>
                  </>
                )}
                {showReleaseAction && (
                  <Button onClick={onRelease} className="flex-1">
                    Release Payment
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
