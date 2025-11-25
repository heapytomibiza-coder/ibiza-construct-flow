import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { JobCompletionCard } from '@/components/jobs/JobCompletionCard';
import { JobVerificationDialog } from '@/components/jobs/JobVerificationDialog';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { JobQuotesView } from '@/components/jobs/JobQuotesView';
import { SubmitQuoteDialog } from '@/components/jobs/SubmitQuoteDialog';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { EscrowStatusBadge } from '@/components/payments/EscrowStatusBadge';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { useProjectTimeline } from '@/hooks/useProjectTimeline';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { useState } from 'react';
import { Loader2, MapPin, Calendar, DollarSign, User, FileText } from 'lucide-react';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  const { data: job, isLoading, refetch } = useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:profiles!jobs_client_id_fkey(full_name, avatar_url),
          contracts(
            id,
            agreed_amount,
            escrow_status,
            tasker_id,
            tasker:profiles!contracts_tasker_id_fkey(full_name, avatar_url)
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  // Fetch completion details
  const { data: completionEvent } = useQuery({
    queryKey: ['job-completion', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_lifecycle_events')
        .select('*')
        .eq('job_id', jobId)
        .eq('event_type', 'completion_submitted')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId && job?.status === 'completed',
  });

  // Check if review exists
  const { data: existingReview } = useQuery({
    queryKey: ['job-review', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_reviews')
        .select('id')
        .eq('job_id', jobId)
        .eq('client_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId && !!user && job?.status === 'closed',
  });

  const isClient = user?.id === job?.client_id;
  const isProfessional = user?.id === job?.contracts?.[0]?.tasker_id;
  const contract = job?.contracts?.[0];
  
  const { data: paymentStatus } = usePaymentStatus(jobId || null);
  const { data: timelineEvents } = useProjectTimeline(jobId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      open: 'secondary',
      in_progress: 'default',
      completed: 'outline',
      closed: 'default',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {getStatusBadge(job.status)}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {contract && (
          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Contract Amount</p>
              <p className="text-2xl font-bold">${contract.agreed_amount}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {paymentStatus?.status && (
                <PaymentStatusBadge status={paymentStatus.status} />
              )}
              {contract.escrow_status && (
                <EscrowStatusBadge status={contract.escrow_status} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{job.description}</p>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {typeof job.location === 'string' ? job.location : 'Remote'}
                  </p>
                </div>
                {job.budget_value && (
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      ${job.budget_value}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quotes Section */}
          {(isClient || job.status === 'open') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quotes</CardTitle>
                  {!isClient && job.status === 'open' && (
                    <Button onClick={() => setQuoteDialogOpen(true)} size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Quote
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <JobQuotesView jobId={job.id} isClient={isClient} />
              </CardContent>
            </Card>
          )}

          {/* Completion Card - For Professionals */}
          {isProfessional && job.status === 'in_progress' && (
            <JobCompletionCard
              jobId={job.id}
              contractId={contract?.id}
              onComplete={() => refetch()}
            />
          )}

          {/* Completion Details - For Clients */}
          {isClient && job.status === 'completed' && completionEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Work Submitted for Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-semibold">Completion Notes:</Label>
                  <p className="text-sm mt-2">{(completionEvent.metadata as any)?.notes || ''}</p>
                </div>

                {Array.isArray((completionEvent.metadata as any)?.deliverables) && (completionEvent.metadata as any).deliverables.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Deliverables:</Label>
                    <ul className="space-y-1 mt-2">
                      {((completionEvent.metadata as any).deliverables as string[]).map((item: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => setVerificationOpen(true)} className="w-full" size="lg">
                  Review & Verify Work
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Review Prompt - For Clients */}
          {isClient && job.status === 'closed' && !existingReview && contract && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Help others by sharing your experience working with{' '}
                  {(contract.tasker as any)?.full_name}
                </p>
                <Button onClick={() => setReviewOpen(true)} className="w-full">
                  Write Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{(job.client as any)?.full_name || 'Client'}</p>
                  <p className="text-sm text-muted-foreground">Posted this job</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          {contract?.tasker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Professional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                <div>
                  <p className="font-medium">{(contract.tasker as any)?.full_name}</p>
                  <p className="text-sm text-muted-foreground">Assigned professional</p>
                </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Timeline */}
          {timelineEvents && timelineEvents.length > 0 && (
            <ProjectTimeline events={timelineEvents} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      {isClient && completionEvent && contract && (
        <>
          <JobVerificationDialog
            open={verificationOpen}
            onOpenChange={setVerificationOpen}
            jobId={job.id}
            contractId={contract.id}
            completionNotes={(completionEvent.metadata as any)?.notes}
            deliverables={(completionEvent.metadata as any)?.deliverables}
            onVerified={() => refetch()}
          />
          
          <ReviewDialog
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            jobId={job.id}
            professionalId={contract.tasker_id}
            professionalName={(contract.tasker as any)?.full_name || 'Professional'}
            onReviewSubmitted={() => refetch()}
          />
        </>
      )}

      {/* Submit Quote Dialog */}
      <SubmitQuoteDialog
        jobId={job.id}
        jobTitle={job.title}
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
      />
    </div>
  );
}
