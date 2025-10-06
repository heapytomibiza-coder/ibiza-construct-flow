import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisputes } from '@/hooks/useDisputes';
import { DisputeConversation } from './DisputeConversation';
import { AutomatedTimelineTracker } from './AutomatedTimelineTracker';
import { DisputeEvidence } from './DisputeEvidence';
import { ResolutionProposal } from './ResolutionProposal';
import { MediatorDashboard } from './MediatorDashboard';
import { ResolutionBuilder } from './ResolutionBuilder';
import { DisputeAgreementFlow } from './DisputeAgreementFlow';
import { CounterProposalList } from './CounterProposalList';
import { EnforcementTracker } from './EnforcementTracker';
import CaseAuditViewer from './CaseAuditViewer';
import { QualityScoreBadge } from './QualityScoreBadge';
import FeedbackPrompt from './FeedbackPrompt';
import { supabase } from '@/integrations/supabase/client';
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
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSide, setUserSide] = useState<'client' | 'professional'>('client');
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [clientQuality, setClientQuality] = useState<number>();
  const [proQuality, setProQuality] = useState<number>();
  
  const {
    dispute,
    evidence,
    timeline,
    resolution,
    messages,
    disputeLoading,
    messagesLoading,
    sendMessage,
    updateDisputeStatus,
  } = useDisputes(undefined, disputeId);

  // Get current user and check admin status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!roles);

        // Determine user side in dispute
        if (dispute) {
          setUserSide(dispute.created_by === user.id ? 'client' : 'professional');
        }
      }
    };
    checkUser();
  }, [dispute]);

  // Load audit trail
  useEffect(() => {
    if (!disputeId) return;
    const loadAudit = async () => {
      const { data } = await supabase
        .from('case_audit_trail' as any)
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: false });
      setAuditItems(data || []);
    };
    loadAudit();
  }, [disputeId]);

  // Load quality scores
  useEffect(() => {
    if (!dispute) return;
    const loadQuality = async () => {
      if (dispute.created_by) {
        const { data: cq } = await supabase
          .from('quality_scores' as any)
          .select('score')
          .eq('user_id', dispute.created_by)
          .maybeSingle();
        setClientQuality((cq as any)?.score);
      }
      if (dispute.disputed_against) {
        const { data: pq } = await supabase
          .from('quality_scores' as any)
          .select('score')
          .eq('user_id', dispute.disputed_against)
          .maybeSingle();
        setProQuality((pq as any)?.score);
      }
    };
    loadQuality();
  }, [dispute]);

  // Trigger feedback prompt on resolution
  useEffect(() => {
    if (!dispute || !currentUserId) return;
    const checkFeedback = async () => {
      const isResolved = dispute.status === 'resolved';
      if (!isResolved) return;

      const { data: fb } = await supabase
        .from('dispute_feedback' as any)
        .select('id')
        .eq('dispute_id', disputeId)
        .eq('respondent_id', currentUserId)
        .maybeSingle();

      if (!fb) setShowFeedback(true);
    };
    checkFeedback();
  }, [dispute, currentUserId, disputeId]);

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
      {/* Admin Mediator Dashboard */}
      {isAdmin && (
        <MediatorDashboard disputeId={disputeId} />
      )}

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
              {clientQuality != null && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">Client</span>
                  <QualityScoreBadge score={clientQuality} />
                </div>
              )}
              {proQuality != null && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">Pro</span>
                  <QualityScoreBadge score={proQuality} />
                </div>
              )}
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

      {/* Communication Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisputeConversation
          disputeId={disputeId}
          messages={(messages as any) || []}
          currentUserId={currentUserId}
          onSendMessage={(message, templateUsed) =>
            sendMessage.mutate({
              disputeId,
              message,
              templateUsed,
            })
          }
          isSending={sendMessage.isPending}
        />
        <AutomatedTimelineTracker
          disputeId={disputeId}
          timeline={timeline || []}
          deadlineAt={dispute?.response_deadline || undefined}
          escalationLevel={dispute?.escalation_level || 1}
          status={dispute?.status || 'open'}
        />
      </div>

      {/* Evidence & Resolution Tabs */}
      <Tabs defaultValue="evidence" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="resolution">Resolution</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="builder">Build Resolution</TabsTrigger>
          )}
          <TabsTrigger value="counter">Counter-Proposals</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence">
          <DisputeEvidence disputeId={disputeId} evidence={evidence || []} />
        </TabsContent>

        <TabsContent value="resolution">
          <div className="space-y-4">
            <DisputeAgreementFlow 
              disputeId={disputeId} 
              side={userSide}
            />
            {resolution && (
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Legacy Resolution Details</h3>
                  <div className="space-y-2">
                    <p><strong>Type:</strong> {resolution.resolution_type}</p>
                    <p><strong>Amount:</strong> ${resolution.amount?.toFixed(2) || '0.00'}</p>
                    <p><strong>Details:</strong> {resolution.details}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="builder">
            <ResolutionBuilder disputeId={disputeId} />
          </TabsContent>
        )}

        <TabsContent value="counter">
          <CounterProposalList disputeId={disputeId} />
        </TabsContent>

        <TabsContent value="enforcement">
          <EnforcementTracker disputeId={disputeId} />
        </TabsContent>

        <TabsContent value="audit">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Case Audit Trail</h3>
            <CaseAuditViewer disputeId={disputeId} />
          </Card>
        </TabsContent>
      </Tabs>

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">How was your experience?</h3>
            <FeedbackPrompt
              disputeId={disputeId}
              onSubmit={async () => {
                setShowFeedback(false);
              }}
              onSkip={() => setShowFeedback(false)}
            />
          </Card>
        </div>
      )}

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
