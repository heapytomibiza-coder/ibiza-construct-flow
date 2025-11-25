import { useParams, useNavigate } from 'react-router-dom';
import { useContract } from '@/hooks/useContract';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkSubmissionForm } from '@/components/contract/WorkSubmissionForm';
import { WorkReviewCard } from '@/components/contract/WorkReviewCard';
import { ArrowLeft, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contract, contractLoading } = useContract(contractId || '');

  if (contractLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Contract not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProfessional = false; // TODO: Get from contract data
  const isClient = user?.id === contract.client_id;
  
  const contractStatus = contract.work_approved_at ? 'completed' : contract.work_submitted_at ? 'under_review' : 'active';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      active: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">Contract Details</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {contract.type || 'Standard Contract'}
                </div>
              </div>
              {getStatusBadge(contractStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Contract Amount</p>
                  <p className="text-lg font-semibold">${contract.agreed_amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-semibold">
                    {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Parties</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">Client #{contract.client_id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contract ID</p>
                  <p className="font-medium">#{contract.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Submission / Review */}
        {contractStatus === 'active' && (
          <>
            {isProfessional && !contract.work_submitted_at && (
              <WorkSubmissionForm contractId={contract.id} />
            )}
            
            {contract.work_submitted_at && !contract.work_approved_at && isClient && (
              <WorkReviewCard 
                contractId={contract.id}
                submission={{
                  id: contract.id,
                  notes: '',
                  submitted_at: contract.work_submitted_at
                }}
              />
            )}

            {contract.work_submitted_at && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Work Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(contract.work_submitted_at), { addSuffix: true })}
                      </span>
                    </div>
                    {contract.work_approved_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Approved</span>
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(contract.work_approved_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreed Amount</span>
                <span className="font-semibold">${contract.agreed_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission ({(contract.commission_rate * 100).toFixed(0)}%)</span>
                <span className="font-semibold">${contract.commission_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow Status</span>
                <Badge variant="outline">{contract.escrow_status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones - Hidden for now */}
        {false && contract.milestones && contract.milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contract.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">Milestone {index + 1}</p>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">${milestone.amount.toFixed(2)}</p>
                      <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                        {milestone.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
