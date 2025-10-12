import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { EscrowMilestone } from "@/hooks/useEscrowMilestones";
import { formatDistanceToNow } from "date-fns";

interface MilestoneCardProps {
  milestone: EscrowMilestone;
  userRole: 'professional' | 'client';
  onComplete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

export const MilestoneCard = ({ 
  milestone, 
  userRole,
  onComplete,
  onApprove,
  onReject 
}: MilestoneCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500';
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'approved': return 'bg-green-600/10 text-green-600';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canComplete = userRole === 'professional' && milestone.status === 'in_progress';
  const canApprove = userRole === 'client' && milestone.status === 'completed';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Milestone #{milestone.milestone_number}: {milestone.title}
          </CardTitle>
          <Badge className={getStatusColor(milestone.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(milestone.status)}
              {milestone.status}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestone.description && (
          <p className="text-sm text-muted-foreground">{milestone.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">€{milestone.amount.toFixed(2)}</p>
            {milestone.due_date && (
              <p className="text-sm text-muted-foreground">
                Due {formatDistanceToNow(new Date(milestone.due_date), { addSuffix: true })}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {canComplete && (
              <Button onClick={() => onComplete?.(milestone.id)} size="sm">
                Mark Complete
              </Button>
            )}
            {canApprove && (
              <>
                <Button onClick={() => onApprove?.(milestone.id)} size="sm">
                  Approve & Release Payment
                </Button>
                <Button 
                  onClick={() => onReject?.(milestone.id, 'Work does not meet requirements')} 
                  variant="outline" 
                  size="sm"
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {milestone.completed_date && (
          <p className="text-xs text-muted-foreground">
            Completed {formatDistanceToNow(new Date(milestone.completed_date), { addSuffix: true })}
          </p>
        )}
        
        {milestone.rejection_reason && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive font-medium">Rejection Reason:</p>
            <p className="text-sm text-muted-foreground">{milestone.rejection_reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
