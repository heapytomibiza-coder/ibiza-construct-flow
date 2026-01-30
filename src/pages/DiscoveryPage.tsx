import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJobRoute } from '@/lib/navigation';
import { JobFilters } from '@/components/discovery/JobFilters';
import { formatDistanceToNow } from 'date-fns';

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    location: '',
    budgetRange: [0, 10000] as [number, number],
    urgent: false,
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs-discovery', searchTerm, filters],
    queryFn: async () => {
      // Use public_jobs_preview for anonymous/non-pro privacy (no client_id, no sensitive fields)
      let query = supabase
        .from('public_jobs_preview')
        .select('*')
        .eq('status', 'open')
        .order('published_at', { ascending: false, nullsFirst: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,teaser.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.filter(job => {
        // Location filter using area/town (no address in preview)
        if (filters.location) {
          const locationStr = job.area || job.town || '';
          if (!locationStr.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
          }
        }
        if (job.budget_value) {
          if (job.budget_value < filters.budgetRange[0] || job.budget_value > filters.budgetRange[1]) {
            return false;
          }
        }
        return true;
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Jobs</h1>
          <p className="text-muted-foreground">
            Find opportunities that match your skills and expertise
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs by title, description, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <JobFilters filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-24 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs?.map((job) => {
              // public_jobs_preview has no client/micro joins - use safe fallbacks
              const budget = job.budget_value;
              const location = job.area || job.town || 'Ibiza';

              return (
                <Card
                  key={job.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(getJobRoute(job.id))}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {job.teaser || 'No description'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {budget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            €{budget}
                          </span>
                        )}
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button>View Details</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && jobs?.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No jobs found. Try adjusting your search or filters.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
