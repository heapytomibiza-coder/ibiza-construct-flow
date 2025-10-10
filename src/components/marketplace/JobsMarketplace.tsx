import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, MapPin, Euro, Calendar, 
  Grid, List, SortAsc, Briefcase, Clock, Tag
} from 'lucide-react';
import { JobListingCard } from './JobListingCard';
import { SendOfferModal } from './SendOfferModal';
import { SubscriptionUpsellBanner } from './SubscriptionUpsellBanner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const JobsMarketplace: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightJobId = searchParams.get('highlight');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [selectedJobForOffer, setSelectedJobForOffer] = useState<string | null>(null);

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

      // Get unique micro_ids
      const microIds = [...new Set(jobsData?.map(job => job.micro_id).filter(Boolean) || [])];
      
      // Fetch service data for these micros
      let servicesMap: any = {};
      if (microIds.length > 0) {
        const { data: servicesData } = await supabase
          .from('services_micro')
          .select('id, category, subcategory, micro')
          .in('id', microIds);
        
        servicesMap = (servicesData || []).reduce((acc: any, service: any) => {
          acc[service.id] = service;
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
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      (job.location?.area?.toLowerCase().includes(locationFilter.toLowerCase()));
    
    const matchesBudget = budgetFilter === 'all' || 
      (budgetFilter === 'low' && job.budget_value < 100) ||
      (budgetFilter === 'medium' && job.budget_value >= 100 && job.budget_value < 500) ||
      (budgetFilter === 'high' && job.budget_value >= 500);
    
    const matchesCategory = categoryFilter === 'all' || 
      job.title.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      job.description.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      job.micro_id?.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesLocation && matchesBudget && matchesCategory;
  });

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
    
    setSelectedJobForOffer(jobId);
  };

  const handleOfferSent = () => {
    setSelectedJobForOffer(null);
    toast.success('Offer sent successfully!');
  };

  const handleSaveJob = (jobId: string) => {
    toast.success('Job saved to favorites');
  };

  const handleMessageClient = (jobId: string) => {
    toast.info('Message feature available - Click to start conversation', {
      description: `Job ID: ${jobId}`,
      action: {
        label: 'Start Chat',
        onClick: () => {
          // TODO: Implement messaging functionality
          console.log('Starting chat for job:', jobId);
        }
      }
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Available Jobs
          </h1>
          <p className="text-muted-foreground">
            {filteredJobs.length} jobs available in your area
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-background">
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
                <SelectItem value="gardening">Gardening</SelectItem>
                <SelectItem value="moving">Moving & Delivery</SelectItem>
                <SelectItem value="assembly">Assembly</SelectItem>
                <SelectItem value="handyman">Handyman</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={budgetFilter} onValueChange={setBudgetFilter}>
              <SelectTrigger className="bg-background">
                <Euro className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Budget range" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All budgets</SelectItem>
                <SelectItem value="low">Under €100</SelectItem>
                <SelectItem value="medium">€100 - €500</SelectItem>
                <SelectItem value="high">€500+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="created_at">Newest first</SelectItem>
                <SelectItem value="budget_value">Highest budget</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Upsell Banner */}
      <SubscriptionUpsellBanner />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-xl font-bold">{filteredJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Budget</p>
                <p className="text-xl font-bold">
                  €{Math.round(filteredJobs.reduce((acc, job) => acc + job.budget_value, 0) / filteredJobs.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posted Today</p>
                <p className="text-xl font-bold">
                  {filteredJobs.filter(job => 
                    new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Areas</p>
                <p className="text-xl font-bold">
                  {new Set(filteredJobs.map(job => job.location?.area).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings - 3 Column Grid */}
      <div className={`grid gap-6 ${viewMode === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
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
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Send Offer Modal */}
      {selectedJobForOffer && (
        <SendOfferModal
          jobId={selectedJobForOffer}
          onClose={() => setSelectedJobForOffer(null)}
          onOfferSent={handleOfferSent}
        />
      )}
    </div>
  );
};