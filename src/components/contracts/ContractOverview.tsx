import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useContract } from '@/hooks/useContract';
import { FileText, DollarSign, Calendar, User, CheckCircle, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { SplitMilestonesDialog } from './SplitMilestonesDialog';
import { FundEscrowDialog } from './FundEscrowDialog';
import { MilestonesList } from './MilestonesList';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';

interface ContractOverviewProps {
  jobId: string;
  onFundEscrow?: () => void;
}

export function ContractOverview({ jobId, onFundEscrow }: ContractOverviewProps) {
  const { user } = useAuth();
  const { contract, contractLoading } = useContract(jobId);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);
  const { createConversation, isCreating } = useConversations();
  const navigate = useNavigate();

  const handleStartConversation = () => {
    if (!contract || !user?.id) return;
    
    const otherUserId = user.id === contract.client_id ? contract.tasker_id : contract.client_id;
    
    createConversation(
      {
        otherUserId,
        jobId: contract.job_id,
        contractId: contract.id,
      },
      {
        onSuccess: () => {
          navigate('/messages');
        },
      }
    );
  };

  if (contractLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Contract Yet</CardTitle>
          <CardDescription>
            A contract will be created when you accept a quote
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isClient = user?.id === contract.client_id;
  const isProfessional = user?.id === contract.tasker_id;
  const professional = Array.isArray(contract.professional) 
    ? contract.professional[0] 
    : contract.professional;
  const milestones = Array.isArray(contract.milestones) 
    ? contract.milestones 
    : [];

  const needsFunding = contract.escrow_status === 'pending';
  const canSplit = milestones.length === 1 && isClient && needsFunding;
  const userRole = isProfessional ? 'professional' : isClient ? 'client' : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/10 text-green-700 border-green-200',
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-500/10 text-blue-700 border-blue-200',
      cancelled: 'bg-red-500/10 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Details
              </CardTitle>
              <CardDescription>Active contract with payment milestones</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(contract.type)}>
                {contract.type}
              </Badge>
              <Badge className={getStatusColor(contract.escrow_status)}>
                Escrow: {contract.escrow_status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Professional Info */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={professional?.avatar_url} />
              <AvatarFallback>
                {professional?.full_name?.[0] || professional?.display_name?.[0] || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {isProfessional ? 'Your Contract' : 'Working with'}
              </div>
              <div className="text-sm text-muted-foreground">
                {professional?.full_name || professional?.display_name || 'Professional'}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contract Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-xl font-bold">
                  €{contract.agreed_amount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">
                  {format(new Date(contract.created_at), 'PPP')}
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Payment Milestones</h4>
              {canSplit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSplitDialog(true)}
                >
                  Split into Phases
                </Button>
              )}
            </div>

            {userRole && <MilestonesList contractId={contract.id} userRole={userRole} />}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {needsFunding && isClient && (
              <Button 
                onClick={() => setShowFundDialog(true)}
                className="flex-1"
                size="lg"
              >
                Fund Escrow (€{contract.agreed_amount.toFixed(2)})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleStartConversation}
              disabled={isCreating}
              className={needsFunding && isClient ? "" : "flex-1"}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message {isProfessional ? 'Client' : 'Professional'}
            </Button>
          </div>

          {needsFunding && isClient && (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-yellow-900">Action Required</div>
                <div className="text-sm text-yellow-700">
                  Please fund the escrow to allow the professional to start work
                </div>
              </div>
            </div>
          )}

          {contract.escrow_status === 'funded' && (
            <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Escrow Funded</div>
                <div className="text-sm text-green-700">
                  Payment secured. {isProfessional ? 'You can now begin work.' : 'Work can now begin.'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {canSplit && (
        <SplitMilestonesDialog
          open={showSplitDialog}
          onOpenChange={setShowSplitDialog}
          contractId={contract.id}
          totalAmount={contract.agreed_amount}
        />
      )}

      <FundEscrowDialog
        open={showFundDialog}
        onOpenChange={setShowFundDialog}
        contractId={contract.id}
        amount={contract.agreed_amount}
        jobTitle={contract.job_id}
      />
    </>
  );
}
