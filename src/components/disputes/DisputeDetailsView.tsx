import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisputes } from '@/hooks/useDisputes';
import { DisputeMessages } from './DisputeMessages';
import { DisputeTimeline } from './DisputeTimeline';
import { DisputeEvidence } from './DisputeEvidence';
import { ResolutionProposal } from './ResolutionProposal';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DisputeDetailsViewProps {
  disputeId: string;
}

export const DisputeDetailsView = ({ disputeId }: DisputeDetailsViewProps) => {
  const [showResolutionProposal, setShowResolutionProposal] = useState(false);
  const { dispute, evidence, timeline, resolution, disputeLoading, updateDisputeStatus } = useDisputes(undefined, disputeId);

  if (disputeLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Dispute not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <h1 className="text-2xl font-bold">{dispute.title}</h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dispute #{dispute.dispute_number}</span>
                <span>•</span>
                <span>Opened {formatDistanceToNow(new Date(dispute.created_at))} ago</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(dispute.status)}>
                {dispute.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant={getPriorityColor(dispute.priority)}>
                {dispute.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{dispute.type.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Amount Disputed</p>
                <p className="font-medium">${dispute.amount_disputed?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Escalation Level</p>
                <p className="font-medium">Level {dispute.escalation_level}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {dispute.description}
            </p>
          </div>

          {dispute.status === 'open' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateDisputeStatus.mutate({
                  disputeId,
                  status: 'in_progress'
                })}
              >
                Mark In Progress
              </Button>
              <Button
                size="sm"
                onClick={() => setShowResolutionProposal(true)}
              >
                Propose Resolution
              </Button>
            </div>
          )}

          {dispute.status === 'in_progress' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600"
                onClick={() => updateDisputeStatus.mutate({
                  disputeId,
                  status: 'resolved'
                })}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Resolved
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResolutionProposal(true)}
              >
                Propose Resolution
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          {resolution && (
            <TabsTrigger value="resolution">Resolution</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="messages">
          <DisputeMessages disputeId={disputeId} />
        </TabsContent>

        <TabsContent value="evidence">
          <DisputeEvidence disputeId={disputeId} evidence={evidence || []} />
        </TabsContent>

        <TabsContent value="timeline">
          <DisputeTimeline timeline={timeline || []} />
        </TabsContent>

        {resolution && (
          <TabsContent value="resolution">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Resolution Details</h3>
                <div className="space-y-2">
                  <p><strong>Type:</strong> {resolution.resolution_type}</p>
                  <p><strong>Amount:</strong> ${resolution.amount?.toFixed(2) || '0.00'}</p>
                  <p><strong>Details:</strong> {resolution.details}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {showResolutionProposal && (
        <ResolutionProposal
          open={showResolutionProposal}
          onOpenChange={setShowResolutionProposal}
          disputeId={disputeId}
        />
      )}
    </div>
  );
};
