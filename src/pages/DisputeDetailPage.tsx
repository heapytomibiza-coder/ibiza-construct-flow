import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DisputeProgressTracker } from '@/components/disputes/DisputeProgressTracker';
import { TransparencyDashboard } from '@/components/disputes/TransparencyDashboard';
import { BilateralEvidenceUploader } from '@/components/disputes/BilateralEvidenceUploader';
import { DisputeTimeline } from '@/components/disputes/DisputeTimeline';
import { ResolutionProposals } from '@/components/disputes/ResolutionProposals';
import { Loader2 } from 'lucide-react';

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['dispute', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          jobs (id, title, client_id),
          contracts (id, client_id, tasker_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: evidence = [] } = useQuery({
    queryKey: ['dispute-evidence', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispute_evidence')
        .select('*')
        .eq('dispute_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['dispute-timeline', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispute_timeline')
        .select('*')
        .eq('dispute_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: resolutions = [] } = useQuery({
    queryKey: ['dispute-resolutions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispute_resolutions')
        .select('*')
        .eq('dispute_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!dispute) {
    return <div className="container mx-auto py-8">Dispute not found</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{dispute.title}</h1>
        <p className="text-muted-foreground mt-2">{dispute.description}</p>
      </div>

      {/* Progress Tracker */}
      <DisputeProgressTracker currentStage={dispute.stage} />

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Dispute Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{dispute.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{dispute.workflow_state}</span>
                  </div>
                  {dispute.amount_disputed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">€{dispute.amount_disputed}</span>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="evidence">
              <BilateralEvidenceUploader
                evidence={evidence}
                onUpload={() => {
                  // TODO: Implement evidence upload modal
                }}
              />
            </TabsContent>

            <TabsContent value="resolutions">
              <ResolutionProposals
                disputeId={id!}
                resolutions={resolutions}
              />
            </TabsContent>

            <TabsContent value="timeline">
              <DisputeTimeline timeline={timeline} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <TransparencyDashboard dispute={dispute} />
        </div>
      </div>
    </div>
  );
}
