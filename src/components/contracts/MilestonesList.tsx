import { useEscrowMilestones } from "@/hooks/useEscrowMilestones";
import { MilestoneCard } from "./MilestoneCard";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MilestonesListProps {
  contractId: string;
  userRole: 'professional' | 'client';
}

export const MilestonesList = ({ contractId, userRole }: MilestonesListProps) => {
  const { milestones, loading, updateMilestone, approveMilestone, rejectMilestone } = useEscrowMilestones(contractId);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; milestoneId: string | null }>({
    open: false,
    milestoneId: null
  });

  const handleComplete = async (milestoneId: string) => {
    await updateMilestone(milestoneId, { status: 'completed' });
  };

  const handleApprove = async (milestoneId: string) => {
    await approveMilestone(milestoneId);
  };

  const handleReject = async (milestoneId: string, reason: string) => {
    await rejectMilestone(milestoneId, reason);
    setRejectDialog({ open: false, milestoneId: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No milestones created yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            userRole={userRole}
            onComplete={handleComplete}
            onApprove={handleApprove}
            onReject={(id) => setRejectDialog({ open: true, milestoneId: id })}
          />
        ))}
      </div>

      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, milestoneId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this milestone? The professional will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectDialog.milestoneId && handleReject(rejectDialog.milestoneId, 'Work does not meet requirements')}
            >
              Reject Milestone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
