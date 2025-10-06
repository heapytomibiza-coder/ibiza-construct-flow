import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEscrowMilestones } from "@/hooks/useEscrowMilestones";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { MilestoneDetailsDialog } from "./MilestoneDetailsDialog";
import { ApproveRejectDialog } from "./ApproveRejectDialog";
import { ReleaseEscrowDialog } from "./ReleaseEscrowDialog";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp 
} from "lucide-react";

interface EscrowDashboardProps {
  contractId: string;
  userRole: 'client' | 'professional';
}

export const EscrowDashboard = ({ contractId, userRole }: EscrowDashboardProps) => {
  const { milestones, loading } = useEscrowMilestones(contractId);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);

  if (loading) {
    return <div className="text-center py-8">Loading escrow dashboard...</div>;
  }

  // Calculate statistics
  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const releasedAmount = milestones
    .filter(m => m.status === 'released')
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const pendingAmount = milestones
    .filter(m => m.status === 'pending' || m.status === 'in_progress')
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const completedCount = milestones.filter(m => 
    m.status === 'completed' || m.status === 'released'
  ).length;

  const handleMilestoneClick = (milestone: any) => {
    setSelectedMilestone(milestone);
    setShowDetailsDialog(true);
  };

  const handleApprove = () => {
    setShowDetailsDialog(false);
    setShowApproveDialog(true);
  };

  const handleReject = () => {
    setShowDetailsDialog(false);
    setShowApproveDialog(true);
  };

  const handleRelease = () => {
    setShowDetailsDialog(false);
    setShowReleaseDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Released</p>
              <p className="text-2xl font-bold text-success">${releasedAmount.toFixed(2)}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">${pendingAmount.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-warning" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">
                {completedCount}/{milestones.length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Milestones requiring attention */}
      {userRole === 'client' && (
        <>
          {milestones.filter(m => 
            m.status === 'completed' && !m.approved_at
          ).length > 0 && (
            <Card className="p-6 border-warning bg-warning/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Action Required</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {milestones.filter(m => m.status === 'completed' && !m.approved_at).length}{' '}
                    milestone(s) are awaiting your approval
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const firstPending = milestones.find(m => 
                        m.status === 'completed' && !m.approved_at
                      );
                      if (firstPending) handleMilestoneClick(firstPending);
                    }}
                  >
                    Review Now
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Timeline */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {milestones.filter(m => m.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {milestones.filter(m => m.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {completedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <MilestoneTimeline 
            milestones={milestones} 
            onMilestoneClick={handleMilestoneClick}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <MilestoneTimeline 
            milestones={milestones.filter(m => 
              m.status === 'pending' || m.status === 'in_progress'
            )} 
            onMilestoneClick={handleMilestoneClick}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <MilestoneTimeline 
            milestones={milestones.filter(m => 
              m.status === 'completed' || m.status === 'released'
            )} 
            onMilestoneClick={handleMilestoneClick}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MilestoneDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        milestone={selectedMilestone}
        userRole={userRole}
        onApprove={handleApprove}
        onReject={handleReject}
        onRelease={handleRelease}
      />

      {selectedMilestone && (
        <>
          <ApproveRejectDialog
            open={showApproveDialog}
            onOpenChange={setShowApproveDialog}
            milestoneId={selectedMilestone.id}
            contractId={contractId}
          />

          <ReleaseEscrowDialog
            open={showReleaseDialog}
            onOpenChange={setShowReleaseDialog}
            milestoneId={selectedMilestone.id}
          />
        </>
      )}
    </div>
  );
};
