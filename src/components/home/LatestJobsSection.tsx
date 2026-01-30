import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLatestJobs, formatJobLocation } from '@/hooks/useLatestJobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { JobListingCard } from '@/components/marketplace/JobListingCard';
import { MapPin, Euro, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LatestJobsSection = () => {
  const { t } = useTranslation('home');
  const { data: jobs, isLoading, error } = useLatestJobs(6);

  if (error) {
    console.error('Error loading latest jobs:', error);
    return null;
  }

  // No jobs fallback
  if (!isLoading && (!jobs || jobs.length === 0)) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('latestJobs.title', 'Latest Projects in Ibiza')}
            </h2>
          </div>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {t('latestJobs.emptyState', 'Be the first to post a project!')}
              </p>
              <Button asChild>
                <Link to="/post">{t('latestJobs.postProject', 'Post Your Project')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Adapt job data for JobListingCard format
  const adaptJobForCard = (job: NonNullable<typeof jobs>[0]) => ({
    id: job.id,
    title: job.title,
    description: job.description || job.teaser || '',
    budget_type: job.budget_type,
    budget_value: job.budget_value,
    location: {
      address: '',
      area: formatJobLocation(job.location),
    },
    created_at: job.created_at,
    status: job.status || 'open',
    client: {
      name: job.client.name,
      avatar: job.client.avatar,
    },
    category: job.category_name || undefined,
    answers: job.has_photos ? { extras: { photos: ['placeholder'] } } : undefined,
  });

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('latestJobs.title', 'Latest Projects in Ibiza')}
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('latestJobs.subtitle', 'Real jobs, real budgets, real professionals')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            jobs?.slice(0, 6).map((job) => (
              <JobListingCard
                key={job.id}
                job={adaptJobForCard(job)}
                viewMode="compact"
                previewMode={true}
                className="h-full"
              />
            ))
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/job-board" className="inline-flex items-center gap-2">
              {t('latestJobs.viewAll', 'View All Projects')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestJobsSection;
