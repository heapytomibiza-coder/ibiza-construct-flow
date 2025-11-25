import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const { data: contract } = useQuery({
    queryKey: ['job-contract', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Job not found</p>
            <Button onClick={() => navigate('/jobs')} className="mt-4">
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === job.client_id;
  const jobStatus = contract ? 'in_progress' : job.status || 'open';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'default',
      in_progress: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/jobs')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  Posted by Client #{job.client_id.slice(0, 8)}
                </div>
              </div>
              {getStatusBadge(jobStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{job.description}</p>

            <Separator />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-lg font-semibold">
                    {job.budget_value ? `$${job.budget_value.toFixed(2)}` : job.budget_type || 'TBD'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-lg font-semibold">
                    {typeof job.location === 'object' && job.location !== null 
                      ? 'Custom Location' 
                      : 'Remote'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Posted</p>
                  <p className="text-lg font-semibold">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status */}
        {contract && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Contract</CardTitle>
                <Badge variant="default">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contract Amount</span>
                <span className="font-semibold">${contract.agreed_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Escrow Status</span>
                <Badge variant="outline">{contract.escrow_status}</Badge>
              </div>
              <Button
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="w-full mt-4"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Contract Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {isOwner && jobStatus === 'open' && !contract && (
          <Card>
            <CardContent className="p-6">
              <Button className="w-full" size="lg">
                Hire Professional
              </Button>
            </CardContent>
          </Card>
        )}

        {!isOwner && jobStatus === 'open' && !contract && (
          <Card>
            <CardContent className="p-6">
              <Button className="w-full" size="lg">
                Submit Proposal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
