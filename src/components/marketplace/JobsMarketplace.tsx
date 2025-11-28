import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Grid, List, SortAsc, Briefcase
} from 'lucide-react';
import { JobListingCard } from './JobListingCard';
import { SubmitQuoteDialog } from '@/components/jobs/SubmitQuoteDialog';
import { JobFiltersPanel } from './JobFiltersPanel';
import { EmptyJobBoardState } from './EmptyJobBoardState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface JobsMarketplaceProps {
  searchQuery?: string;
  quickFilter?: string;
}

export const JobsMarketplace: React.FC<JobsMarketplaceProps> = ({
  searchQuery: externalSearchQuery = '',
  quickFilter = ''
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightJobId = searchParams.get('highlight');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [selectedJobForOffer, setSelectedJobForOffer] = useState<{ jobId: string; jobTitle: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    categories: [] as string[],
    budgetRange: [0, 5000] as [number, number],
    startDate: 'all',
    location: '',
    hasPhotos: false,
    highBudget: false,
    highlyRated: false,
    newToday: false
  });

  // Update internal search when external prop changes
  React.useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Apply quick filters
  React.useEffect(() => {
    if (quickFilter === 'high-budget') {
      setFilters(prev => ({ ...prev, highBudget: true, budgetRange: [500, 5000] }));
    } else if (quickFilter === 'photos') {
      setFilters(prev => ({ ...prev, hasPhotos: true }));
    } else if (quickFilter === 'this-week') {
      setFilters(prev => ({ ...prev, startDate: 'this-week' }));
    } else if (quickFilter === 'asap') {
      setFilters(prev => ({ ...prev, startDate: 'asap' }));
    }
  }, [quickFilter]);

  useEffect(() => {
    loadJobs();
  }, [sortBy]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL open jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order(sortBy, { ascending: false });

      if (jobsError) throw jobsError;

      // Get unique micro_ids (now slugs, not UUIDs)
      const microSlugs = [...new Set(jobsData?.map(job => job.micro_id).filter(Boolean) || [])];
      
      // Fetch service data from correct table
      let servicesMap: any = {};
      if (microSlugs.length > 0) {
        const { data: servicesData } = await supabase
          .from('service_micro_categories')
          .select(`
            slug,
            name,
            service_subcategories (
              name,
              service_categories (
                name
              )
            )
          `)
          .in('slug', microSlugs);
        
        servicesMap = (servicesData || []).reduce((acc: any, service: any) => {
          acc[service.slug] = {
            micro: service.name,
            subcategory: service.service_subcategories?.name || '',
            category: service.service_subcategories?.service_categories?.name || ''
          };
          return acc;
        }, {});
      }

      // Get client profiles
      const clientIds = jobsData?.map(job => job.client_id).filter(Boolean) || [];
      let clientProfiles: any = {};
      
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', clientIds);
        
        clientProfiles = (profiles || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }

      const formattedJobs = jobsData?.map(job => {
        const serviceData = servicesMap[job.micro_id];
        return {
          ...job,
          category: serviceData?.category,
          subcategory: serviceData?.subcategory,
          micro: serviceData?.micro,
          client: {
            name: clientProfiles[job.client_id]?.full_name || 'Anonymous Client',
            avatar: clientProfiles[job.client_id]?.avatar_url,
            rating: 4.5, // Mock rating
            jobs_completed: Math.floor(Math.random() * 50) + 1
          }
        };
      }) || [];

      setJobs(formattedJobs);
    } catch (error: any) {
      toast.error('Failed to load jobs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    // Search
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category
    const matchesCategory = filters.categories.length === 0 || 
      filters.categories.includes(job.category);
    
    // Budget range
    const matchesBudget = job.budget_value >= filters.budgetRange[0] && 
      job.budget_value <= filters.budgetRange[1];
    
    // Location
    const matchesLocation = !filters.location || 
      (job.location?.area?.toLowerCase().includes(filters.location.toLowerCase()));
    
    // Start date
    let matchesStartDate = true;
    if (filters.startDate !== 'all') {
      const startDate = job.answers?.logistics?.startDate;
      const isASAP = job.answers?.logistics?.startDatePreset === 'asap';
      
      if (filters.startDate === 'asap') {
        matchesStartDate = isASAP;
      } else if (filters.startDate === 'this-week') {
        matchesStartDate = startDate && new Date(startDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else if (filters.startDate === 'next-week') {
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        matchesStartDate = startDate && new Date(startDate) > weekFromNow && new Date(startDate) <= twoWeeksFromNow;
      }
    }
    
    // Special filters
    const hasPhotos = job.answers?.extras?.photos?.length > 0;
    const matchesPhotos = !filters.hasPhotos || hasPhotos;
    
    const matchesHighBudget = !filters.highBudget || job.budget_value >= 500;
    
    const matchesHighlyRated = !filters.highlyRated || (job.client?.rating >= 4);
    
    const isNewToday = new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    const matchesNewToday = !filters.newToday || isNewToday;

    return matchesSearch && matchesCategory && matchesBudget && matchesLocation && 
           matchesStartDate && matchesPhotos && matchesHighBudget && matchesHighlyRated && matchesNewToday;
  });

  // Featured jobs (high budget + photos + recent)
  const featuredJobs = filteredJobs.filter(job => {
    const hasPhotos = job.answers?.extras?.photos?.length > 0;
    const isHighBudget = job.budget_value >= 500;
    const isRecent = new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    return hasPhotos && isHighBudget && isRecent;
  }).slice(0, 3);

  const regularJobs = filteredJobs.filter(job => !featuredJobs.includes(job));

  const handleSendOffer = async (jobId: string) => {
    if (!user) {
      toast.error('You need to be logged in to send offers');
      return;
    }
    
    // Check if user has professional role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'professional')
      .maybeSingle();
    
    if (!roleData) {
      toast.error('You need to be a professional to send offers');
      return;
    }
    
    // Find the job to get its title
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    setSelectedJobForOffer({ jobId, jobTitle: job.title });
  };

  const handleOfferSent = () => {
    setSelectedJobForOffer(null);
    toast.success('Offer sent successfully!');
  };

  const handleSaveJob = (jobId: string) => {
    toast.success('Job saved to favorites');
  };

  const handleMessageClient = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job?.client_id) {
      toast.error('Unable to start conversation');
      return;
    }
    
    // Navigate to messages page with professional parameter to start conversation
    navigate(`/messages?professional=${job.client_id}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* Filter Panel - Desktop Sidebar */}
      <div className="hidden lg:block">
        <JobFiltersPanel
          open={true}
          onClose={() => {}}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Available Projects
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} opportunities • {featuredJobs.length} featured
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(filters.categories.length > 0 || filters.hasPhotos || filters.highBudget || filters.highlyRated || filters.newToday) && (
                <Badge variant="secondary" className="ml-2">
                  {filters.categories.length + 
                   (filters.hasPhotos ? 1 : 0) + 
                   (filters.highBudget ? 1 : 0) + 
                   (filters.highlyRated ? 1 : 0) + 
                   (filters.newToday ? 1 : 0)}
                </Badge>
              )}
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-background">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="budget_value">Budget</SelectItem>
                <SelectItem value="title">A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-hero text-white">
              ⭐ Featured Opportunities
            </Badge>
            <p className="text-sm text-muted-foreground">
              High-value jobs with detailed requirements
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="ring-2 ring-copper/50 rounded-lg"
              >
                <JobListingCard
                  job={job}
                  onSendOffer={handleSendOffer}
                  onMessage={handleMessageClient}
                  onSave={handleSaveJob}
                  viewMode="card"
                />
              </div>
            ))}
          </div>
        </div>
      )}

        {/* All Jobs Grid */}
        <div className={`grid gap-8 ${viewMode === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {regularJobs.length > 0 ? (
            regularJobs.map((job) => (
              <div
                key={job.id}
                className={cn(
                  "animate-fade-in",
                  highlightJobId === job.id && "ring-2 ring-copper animate-pulse"
                )}
              >
                <JobListingCard
                  job={job}
                  onSendOffer={handleSendOffer}
                  onMessage={handleMessageClient}
                  onSave={handleSaveJob}
                  viewMode={viewMode}
                />
              </div>
            ))
          ) : (
            <EmptyJobBoardState
              isFiltered={filters.categories.length > 0 || filters.hasPhotos || filters.highBudget}
              onClearFilters={() => setFilters({
                categories: [],
                budgetRange: [0, 5000],
                startDate: 'all',
                location: '',
                hasPhotos: false,
                highBudget: false,
                highlyRated: false,
                newToday: false
              })}
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Panel */}
      <JobFiltersPanel
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Submit Quote Dialog */}
      {selectedJobForOffer && (
        <SubmitQuoteDialog
          jobId={selectedJobForOffer.jobId}
          jobTitle={selectedJobForOffer.jobTitle}
          open={true}
          onOpenChange={(open) => !open && setSelectedJobForOffer(null)}
        />
      )}
    </div>
  );
};