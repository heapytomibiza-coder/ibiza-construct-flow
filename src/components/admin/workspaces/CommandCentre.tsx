import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  MessageSquare, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Bot,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import ProfessionalMatchModal from '../ProfessionalMatchModal';
import CommunicationsDrafterModal from '../CommunicationsDrafterModal';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  client_id: string;
  service_id: string;
  budget_range: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client_name?: string;
  service_name?: string;
  applications_count?: number;
}

export default function CommandCentre() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    open: 0,
    in_progress: 0,
    completed: 0
  });

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data: jobsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!client_id(full_name),
          services!service_id(category, subcategory, micro)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get application counts separately
      const { data: applicationData } = await supabase
        .from('professional_applications')
        .select('booking_id');
      
      const applicationCounts = applicationData ? 
        Object.entries(
          applicationData.reduce((acc: Record<string, number>, app) => {
            acc[app.booking_id] = (acc[app.booking_id] || 0) + 1;
            return acc;
          }, {})
        ).map(([booking_id, count]) => ({ booking_id, count })) : [];

      const processedJobs = jobsData?.map(job => {
        const appCount = applicationCounts?.find(ac => ac.booking_id === job.id)?.count || 0;
        return {
          ...job,
          client_name: job.profiles?.full_name || 'Unknown Client',
          service_name: job.services ? 
            `${job.services.category} > ${job.services.subcategory}` : 
            'Unknown Service',
          applications_count: appCount
        };
      }) || [];

      setJobs(processedJobs);
      calculateStats(processedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobData: Job[]) => {
    const stats = jobData.reduce((acc, job) => {
      acc.total++;
      switch (job.status) {
        case 'draft':
          acc.draft++;
          break;
        case 'open':
          acc.open++;
          break;
        case 'in_progress':
          acc.in_progress++;
          break;
        case 'completed':
          acc.completed++;
          break;
      }
      return acc;
    }, { total: 0, draft: 0, open: 0, in_progress: 0, completed: 0 });

    setStats(stats);
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'outline' as const, icon: <Clock className="w-3 h-3" /> },
      open: { variant: 'default' as const, icon: <Play className="w-3 h-3" /> },
      in_progress: { variant: 'secondary' as const, icon: <RefreshCw className="w-3 h-3" /> },
      completed: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  const handleBulkBroadcast = () => {
    setShowCommModal(true);
  };

  const handleFindProfessionals = (job: Job) => {
    setSelectedJob(job);
    setShowMatchModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Jobs Board</CardTitle>
              <CardDescription>
                Monitor and manage all jobs across the platform
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {selectedJobs.length > 0 && (
                <>
                  <Button size="sm" variant="outline" onClick={handleBulkBroadcast}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Draft Message ({selectedJobs.length})
                  </Button>
                  <Button size="sm" onClick={handleBulkBroadcast}>
                    Broadcast to Professionals ({selectedJobs.length})
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading jobs...
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={() => handleJobSelect(job.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.title || 'Untitled Job'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {job.description || 'No description'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{job.client_name}</TableCell>
                    <TableCell>
                      <span className="text-sm">{job.service_name}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{job.budget_range || 'Not set'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(job.created_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {job.applications_count || 0} apps
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleFindProfessionals(job)}
                        >
                          <Bot className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI-Powered Modals */}
      {selectedJob && (
        <ProfessionalMatchModal
          isOpen={showMatchModal}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedJob(null);
          }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          jobDescription={selectedJob.description || ''}
        />
      )}

      <CommunicationsDrafterModal
        isOpen={showCommModal}
        onClose={() => setShowCommModal(false)}
        context={{
          type: 'job_broadcast',
          recipients: selectedJobs.map(id => `job_${id}`),
          data: {
            jobs: filteredJobs.filter(job => selectedJobs.includes(job.id))
          }
        }}
      />
    </div>
  );
}