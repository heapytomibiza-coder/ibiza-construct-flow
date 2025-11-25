import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCounterProposals } from '@/hooks/disputes/useCounterProposals';
import { MessageSquare, Clock, DollarSign, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CounterProposalForm } from './CounterProposalForm';
import { useState } from 'react';

interface CounterProposalListProps {
  disputeId: string;
}

export function CounterProposalList({ disputeId }: CounterProposalListProps) {
  const { proposals, loading, respondToProposal } = useCounterProposals(disputeId);
  const [showForm, setShowForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'outline';
      case 'superseded':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'settlement': return DollarSign;
      case 'payment_plan': return Clock;
      case 'scope_change': return FileText;
      case 'timeline_adjustment': return Clock;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowForm(false)}>
          ← Back to Proposals
        </Button>
        <CounterProposalForm 
          disputeId={disputeId} 
          onSuccess={() => setShowForm(false)}
        />
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Counter-Proposals</span>
            <Button onClick={() => setShowForm(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Create Proposal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No counter-proposals yet</p>
          <p className="text-sm text-muted-foreground">
            Start negotiations by creating your first counter-proposal
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Counter-Proposals ({proposals.length})</span>
          <Button onClick={() => setShowForm(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((proposal) => {
          const TypeIcon = getTypeIcon(proposal.proposal_type);
          const isExpired = proposal.expires_at && new Date(proposal.expires_at) < new Date();
          
          return (
            <div
              key={proposal.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <TypeIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">
                      {proposal.proposal_type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(proposal.created_at))} ago
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(proposal.status)}>
                  {proposal.status}
                </Badge>
              </div>

              {proposal.amount && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <DollarSign className="w-5 h-5" />
                  {proposal.amount} {proposal.currency}
                </div>
              )}

              {proposal.notes && (
                <p className="text-sm bg-muted p-3 rounded">
                  {proposal.notes}
                </p>
              )}

              {proposal.expires_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {isExpired ? (
                    <span className="text-destructive">Expired</span>
                  ) : (
                    <span>Expires in {formatDistanceToNow(new Date(proposal.expires_at))}</span>
                  )}
                </div>
              )}

              {proposal.response_notes && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-sm font-medium">Response:</p>
                  <p className="text-sm text-muted-foreground">{proposal.response_notes}</p>
                  <p className="text-xs text-muted-foreground">
                    Responded {formatDistanceToNow(new Date(proposal.responded_at!))} ago
                  </p>
                </div>
              )}

              {proposal.status === 'pending' && !isExpired && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    size="sm" 
                    onClick={() => respondToProposal(proposal.id, 'accepted')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => respondToProposal(proposal.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
