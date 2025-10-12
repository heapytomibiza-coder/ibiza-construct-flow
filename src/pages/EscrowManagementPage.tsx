import { useParams } from 'react-router-dom';
import { useContracts, Contract } from '@/hooks/useContracts';
import { useEscrowMilestones } from '@/hooks/useEscrowMilestones';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FundEscrowDialog } from '@/components/escrow/FundEscrowDialog';
import { ReleaseEscrowDialog } from '@/components/escrow/ReleaseEscrowDialog';
import { SplitMilestonesDialog } from '@/components/contracts/SplitMilestonesDialog';
import { useState } from 'react';
import { Loader2, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EscrowManagementPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useAuth();
  const { milestones, loading: milestonesLoading, approveMilestone } = useEscrowMilestones(contractId);
  const { contracts, loading: contractsLoading } = useContracts({ userId: user?.id });
  const { toast } = useToast();
  
  const contract = contracts.find(c => c.id === contractId);
  const loading = milestonesLoading || contractsLoading;
  
  const progress = {
    completedAmount: milestones.filter(m => m.status === 'released').reduce((sum, m) => sum + m.amount, 0),
    remainingAmount: milestones.filter(m => m.status !== 'released').reduce((sum, m) => sum + m.amount, 0),
  };
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const isClient = user?.id === contract?.client_id;
  const isProfessional = user?.id === contract?.tasker_id;

  const handleApproveMilestone = async (milestoneId: string) => {
    try {
      await approveMilestone(milestoneId);
      toast({
        title: "Milestone Approved",
        description: "The milestone has been marked as completed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve milestone",
      });
    }
  };

  const handleReleaseFunds = (milestoneId: string) => {
    setSelectedMilestone(milestoneId);
    setReleaseDialogOpen(true);
  };

  const getMilestoneStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      in_progress: { variant: 'default' as const, label: 'In Progress', icon: Clock },
      completed: { variant: 'outline' as const, label: 'Completed', icon: CheckCircle2 },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle2 },
      released: { variant: 'default' as const, label: 'Released', icon: DollarSign },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Contract not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-muted-foreground">Manage contract milestones and payments</p>
        </div>
        {isClient && contract.escrow_status === 'pending' && (
          <Button onClick={() => setFundDialogOpen(true)} size="lg">
            <DollarSign className="h-4 w-4 mr-2" />
            Fund Escrow
          </Button>
        )}
      </div>

      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Overview</CardTitle>
          <CardDescription>Total Amount: ${contract.agreed_amount}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Escrow Status</p>
              <Badge variant={contract.escrow_status === 'held' ? 'default' : 'secondary'}>
                {contract.escrow_status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">${contract.agreed_amount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Released</p>
              <p className="text-lg font-semibold">${progress.completedAmount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold">${progress.remainingAmount}</p>
            </div>
          </div>
          
          {isClient && milestones.length <= 1 && (
            <Button variant="outline" onClick={() => setSplitDialogOpen(true)}>
              Split into Milestones
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Payment Milestones</h2>
        {milestones.map((milestone) => (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>Milestone #{milestone.milestone_number}</CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </div>
                {getMilestoneStatusBadge(milestone.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">${milestone.amount}</p>
                </div>
                {milestone.due_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">
                      {new Date(milestone.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                {isProfessional && milestone.status === 'in_progress' && (
                  <Button onClick={() => handleApproveMilestone(milestone.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                
                {isClient && milestone.status === 'completed' && (
                  <>
                    <Button onClick={() => handleApproveMilestone(milestone.id)} variant="outline">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReleaseFunds(milestone.id)}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Release Payment
                    </Button>
                  </>
                )}

                {milestone.status === 'released' && (
                  <Badge variant="default" className="text-base px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Payment Released
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      {isClient && (
        <>
          <FundEscrowDialog
            open={fundDialogOpen}
            onOpenChange={setFundDialogOpen}
            milestoneId={milestones[0]?.id || ''}
          />
          
          {selectedMilestone && (
            <ReleaseEscrowDialog
              open={releaseDialogOpen}
              onOpenChange={setReleaseDialogOpen}
              milestoneId={selectedMilestone}
            />
          )}

          <SplitMilestonesDialog
            open={splitDialogOpen}
            onOpenChange={setSplitDialogOpen}
            contractId={contractId!}
            totalAmount={contract.agreed_amount}
          />
        </>
      )}
    </div>
  );
}
