import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Professional {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  primary_trade: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_jobs: number;
  completion_rate: number;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  verification_status: 'verified' | 'pending' | 'rejected';
  last_active: string;
  earnings_month: number;
  next_job_scheduled?: string;
}

interface ProfessionalStats {
  total_professionals: number;
  active_professionals: number;
  verified_professionals: number;
  avg_rating: number;
  total_earnings_month: number;
  jobs_completed_month: number;
}

export const ProfessionalHub = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [stats, setStats] = useState<ProfessionalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  useEffect(() => {
    loadProfessionals();
    loadStats();
  }, []);

  const loadProfessionals = async () => {
    try {
      // Mock professional data - in real implementation, this would come from database
      const mockProfessionals: Professional[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          avatar_url: '/api/placeholder/40/40',
          primary_trade: 'Plumbing',
          experience_years: 8,
          hourly_rate: 85,
          rating: 4.8,
          total_jobs: 247,
          completion_rate: 98.2,
          location: 'Downtown, City Center',
          status: 'active',
          verification_status: 'verified',
          last_active: '2024-01-15T10:30:00Z',
          earnings_month: 4250,
          next_job_scheduled: '2024-01-16T09:00:00Z'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          primary_trade: 'Electrical',
          experience_years: 12,
          hourly_rate: 95,
          rating: 4.9,
          total_jobs: 189,
          completion_rate: 96.8,
          location: 'North District',
          status: 'active',
          verification_status: 'verified',
          last_active: '2024-01-15T14:20:00Z',
          earnings_month: 5180,
          next_job_scheduled: '2024-01-16T11:30:00Z'
        },
        {
          id: '3',
          name: 'Mike Williams',
          email: 'mike.williams@example.com',
          primary_trade: 'Carpentry',
          experience_years: 15,
          hourly_rate: 75,
          rating: 4.7,
          total_jobs: 156,
          completion_rate: 94.5,
          location: 'South Valley',
          status: 'inactive',
          verification_status: 'verified',
          last_active: '2024-01-10T16:45:00Z',
          earnings_month: 2890
        },
        {
          id: '4',
          name: 'Lisa Chen',
          email: 'lisa.chen@example.com',
          primary_trade: 'HVAC',
          experience_years: 6,
          hourly_rate: 80,
          rating: 4.6,
          total_jobs: 98,
          completion_rate: 97.1,
          location: 'East Side',
          status: 'active',
          verification_status: 'pending',
          last_active: '2024-01-15T13:15:00Z',
          earnings_month: 3120,
          next_job_scheduled: '2024-01-17T08:00:00Z'
        }
      ];

      setProfessionals(mockProfessionals);
      setLoading(false);
    } catch (error) {
      console.error('Error loading professionals:', error);
      toast.error('Failed to load professional data');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats data
      const mockStats: ProfessionalStats = {
        total_professionals: 1247,
        active_professionals: 892,
        verified_professionals: 734,
        avg_rating: 4.6,
        total_earnings_month: 248750,
        jobs_completed_month: 1289
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredProfessionals = professionals.filter(prof =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.primary_trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Professional Hub...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Professional Hub</h2>
          <p className="text-muted-foreground">Manage and monitor professional workforce</p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Add Professional
        </Button>
      </div>

      {/* Professional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Professionals</p>
                  <p className="text-2xl font-bold">{stats.total_professionals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active_professionals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{stats.verified_professionals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avg_rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                  <p className="text-2xl font-bold">${(stats.total_earnings_month / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  <p className="text-2xl font-bold">{stats.jobs_completed_month}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search professionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={professional.avatar_url} />
                        <AvatarFallback>{professional.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-muted-foreground">{professional.primary_trade}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{professional.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{professional.rating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {professional.total_jobs} jobs
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${professional.hourly_rate}/hr</div>
                        <div className="text-sm text-muted-foreground">
                          {professional.experience_years} years exp
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(professional.status)}
                        {getVerificationBadge(professional.verification_status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={professional.completion_rate} className="flex-1" />
                        <span className="text-sm font-medium">{professional.completion_rate}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                      <p className="font-medium">${professional.earnings_month}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="font-medium">
                        {new Date(professional.last_active).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Job</p>
                      <p className="font-medium">
                        {professional.next_job_scheduled 
                          ? new Date(professional.next_job_scheduled).toLocaleDateString()
                          : 'None scheduled'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Professional performance metrics and analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Professional verification status and document management tools.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Professional scheduling and availability management tools.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};