import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEscrowMilestones } from '@/hooks/useEscrowMilestones';
import { CheckCircle, Clock, XCircle, DollarSign, Calendar } from 'lucide-react';
import { useState } from 'react';
import { ApproveRejectDialog } from './ApproveRejectDialog';
import { FundEscrowDialog } from './FundEscrowDialog';
import { ReleaseEscrowDialog } from './ReleaseEscrowDialog';

interface MilestonesListProps {
  contractId: string;
  userRole: 'client' | 'professional';
}

export const MilestonesList = ({ contractId, userRole }: MilestonesListProps) => {
  const { milestones, loading } = useEscrowMilestones(contractId);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedAmount = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.amount, 0);
  const progress = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Progress</h3>
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${completedAmount.toFixed(2)} completed</span>
            <span>${totalAmount.toFixed(2)} total</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(milestone.status)}
                  <h4 className="font-semibold text-lg">
                    Milestone {milestone.milestone_number}: {milestone.title}
                  </h4>
                  <Badge variant={getStatusColor(milestone.status)}>
                    {milestone.status}
                  </Badge>
                </div>

                {milestone.description && (
                  <p className="text-muted-foreground mb-4">{milestone.description}</p>
                )}

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">${milestone.amount.toFixed(2)}</span>
                  </div>
                  {milestone.due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(milestone.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {milestone.rejection_reason && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive">
                      <strong>Rejection reason:</strong> {milestone.rejection_reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {userRole === 'client' && milestone.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMilestone(milestone.id);
                        setFundDialogOpen(true);
                      }}
                    >
                      Fund Escrow
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMilestone(milestone.id);
                        setApproveDialogOpen(true);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}

                {userRole === 'client' && milestone.status === 'completed' && (
                  <Button
                    size="sm"
                    className="bg-gradient-hero"
                    onClick={() => {
                      setSelectedMilestone(milestone.id);
                      setReleaseDialogOpen(true);
                    }}
                  >
                    Release Payment
                  </Button>
                )}

                {userRole === 'professional' && milestone.status === 'pending' && (
                  <Button size="sm" variant="outline" disabled>
                    Awaiting Client
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedMilestone && (
        <>
          <ApproveRejectDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            milestoneId={selectedMilestone}
            contractId={contractId}
          />
          <FundEscrowDialog
            open={fundDialogOpen}
            onOpenChange={setFundDialogOpen}
            milestoneId={selectedMilestone}
          />
          <ReleaseEscrowDialog
            open={releaseDialogOpen}
            onOpenChange={setReleaseDialogOpen}
            milestoneId={selectedMilestone}
          />
        </>
      )}
    </div>
  );
};
