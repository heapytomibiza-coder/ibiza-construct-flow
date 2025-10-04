import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeJobUpdates } from '@/hooks/useRealtimeJobUpdates';
import { 
  Briefcase, Clock, CheckCircle, Users, 
  MapPin, Euro, MessageSquare, Plus,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedClientDashboardProps {
  user: any;
  profile: any;
}

export const EnhancedClientDashboard: React.FC<EnhancedClientDashboardProps> = ({
  user,
  profile
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { jobs, loading } = useRealtimeJobUpdates(user?.id);

  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const draftJobs = jobs.filter(j => j.status === 'draft');

  const stats = {
    activeJobs: activeJobs.length,
    totalSpent: completedJobs.reduce((sum, job) => sum + (job.budget_value || 0), 0),
    completedJobs: completedJobs.length,
    draftJobs: draftJobs.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Client Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.full_name || 'Client'}
            </p>
          </div>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Jobs</CardDescription>
              <CardTitle className="text-3xl">{stats.activeJobs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>In progress</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{stats.completedJobs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Spent</CardDescription>
              <CardTitle className="text-3xl">€{stats.totalSpent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Euro className="w-4 h-4" />
                <span>Lifetime</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Draft Jobs</CardDescription>
              <CardTitle className="text-3xl">{stats.draftJobs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Not posted yet</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Active Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
                <CardDescription>
                  Jobs currently in progress or awaiting responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active jobs at the moment</p>
                    <Button className="mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{job.title}</h3>
                                <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                                  {job.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {job.description}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Euro className="w-4 h-4" />
                                  <span>€{job.budget_value}</span>
                                </div>
                                {job.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{(job.location as any).area || 'Location'}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button size="sm" variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                View Applicants
                              </Button>
                              <Button size="sm" variant="ghost">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Messages
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Browse Professionals</h3>
                  <p className="text-sm text-muted-foreground">
                    Find the perfect professional for your next project
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Messages</h3>
                  <p className="text-sm text-muted-foreground">
                    Communicate with your hired professionals
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Help Center</h3>
                  <p className="text-sm text-muted-foreground">
                    Get answers to your questions
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>All Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Full active jobs list */}
                <p className="text-muted-foreground">Active jobs content...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Completed jobs list */}
                <p className="text-muted-foreground">Completed jobs content...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts">
            <Card>
              <CardHeader>
                <CardTitle>Draft Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Draft jobs list */}
                <p className="text-muted-foreground">Draft jobs content...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
