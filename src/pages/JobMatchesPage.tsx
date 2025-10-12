import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { MatchedProfessionalCard } from '@/components/matching/MatchedProfessionalCard';

export default function JobMatchesPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  // Fetch job details
  const { data: job, isLoading: loadingJob } = useQuery({
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
    enabled: !!jobId
  });

  // Fetch matches
  const { data: matchesData, isLoading: loadingMatches } = useQuery({
    queryKey: ['job-matches', jobId, job?.micro_id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-professional-matcher', {
        body: {
          jobId,
          microId: job?.micro_id,
          location: job?.location,
          budget: job?.budget_value,
          description: job?.description,
          limit: 10
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!job && !!job.micro_id
  });

  const isLoading = loadingJob || loadingMatches;
  const matches = matchesData?.matches || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/job/${jobId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Matched Professionals</h1>
          </div>
          
          {job && (
            <p className="text-muted-foreground text-lg">
              We found {matches.length} professionals perfect for "{job.title}"
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Finding the best professionals for you...</p>
            </div>
          </Card>
        )}

        {/* Matches */}
        {!isLoading && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((professional: any) => (
              <MatchedProfessionalCard
                key={professional.user_id}
                professional={professional}
              />
            ))}
          </div>
        )}

        {/* No Matches */}
        {!isLoading && matches.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No professionals found matching your criteria.
            </p>
            <Button onClick={() => navigate('/professionals')}>
              Browse All Professionals
            </Button>
          </Card>
        )}

        {/* Stats */}
        {!isLoading && matchesData && (
          <Card className="mt-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{matchesData.totalCount}</div>
                <div className="text-sm text-muted-foreground">Total Professionals</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{matchesData.matchedCount}</div>
                <div className="text-sm text-muted-foreground">Qualified Matches</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">
                  {matches[0]?.matchScore || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Top Match Score</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
