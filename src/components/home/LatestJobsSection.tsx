import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLatestJobs, formatJobLocation } from '@/hooks/useLatestJobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Euro, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LatestJobsSection = () => {
  const { t } = useTranslation('home');
  const { data: jobs, isLoading, error } = useLatestJobs(6);

  if (error) {
    console.error('Error loading latest jobs:', error);
    return null;
  }

  const isNew = (createdAt: string) => {
    return new Date(createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return t('latestJobs.justNow', 'Just now');
    if (diffHours < 24) return t('latestJobs.hoursAgo', '{{hours}}h ago', { hours: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('latestJobs.daysAgo', '{{days}}d ago', { days: diffDays });
  };

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
              <Link key={job.id} to={`/jobs/${job.id}`} className="group">
                <Card className={cn(
                  "h-full hover:shadow-lg transition-all duration-200",
                  "border-2 border-transparent hover:border-primary/20"
                )}>
                  <CardContent className="p-5">
                    {/* Header with title and badges */}
                    <div className="flex items-start gap-2 mb-3">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex-1 line-clamp-1">
                        {job.title}
                      </h3>
                      {isNew(job.created_at) && (
                        <Badge className="bg-gradient-to-r from-copper to-copper-dark text-white text-xs shrink-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {t('latestJobs.new', 'NEW')}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description || t('latestJobs.noDescription', 'No description provided')}
                    </p>

                    {/* Category badge */}
                    {job.category_name && (
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {job.category_name}
                      </Badge>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        <span className="font-medium text-foreground">
                          €{job.budget_value?.toLocaleString() || '0'}
                          {job.budget_type === 'hourly' && '/hr'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatJobLocation(job.location)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatRelativeTime(job.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
