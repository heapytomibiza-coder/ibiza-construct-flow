import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut, Briefcase, Star, MapPin, DollarSign, 
  Clock, CheckCircle, TrendingUp, Bell 
} from 'lucide-react';
import { toast } from 'sonner';

const ProfessionalDashboard = ({ user, profile }: any) => {
  const [applications, setApplications] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    rating: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchProfessionalData();
  }, [user]);

  const fetchProfessionalData = async () => {
    if (!user) return;
    
    try {
      // Fetch applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('professional_applications')
        .select(`
          *,
          bookings:booking_id (
            title,
            description,
            budget_range,
            services:service_id (category, subcategory, micro)
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Fetch job matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('job_matches')
        .select(`
          *,
          bookings:booking_id (
            title,
            description,
            budget_range,
            client_id,
            services:service_id (category, subcategory, micro)
          )
        `)
        .eq('professional_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      setApplications(applicationsData || []);
      setJobMatches(matchesData || []);

      // Calculate stats
      const activeApps = (applicationsData || []).filter(app => 
        // Applications don't have status, they're all pending by nature
        true
      ).length;

      setStats({
        activeJobs: activeApps,
        applications: (applicationsData || []).length,
        rating: 4.8, // TODO: Calculate from actual reviews
        earnings: 0 // TODO: Calculate from completed jobs
      });

    } catch (error) {
      console.error('Error fetching professional data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Professional Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Professional</Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <MapPin className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stats.applications}</div>
              <p className="text-xs text-muted-foreground">Total submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stats.rating}</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">€{stats.earnings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Job Opportunities
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {jobMatches.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobMatches.length > 0 ? (
                <div className="space-y-4">
                  {jobMatches.slice(0, 3).map((match: any) => (
                    <div key={match.id} className="p-4 border border-sand-dark/20 rounded-lg hover:border-copper/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal mb-1">
                            {match.bookings?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {match.bookings?.services?.category} • {match.bookings?.services?.micro}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {match.status}
                            </Badge>
                            {match.bookings?.budget_range && (
                              <span className="text-sm font-medium text-copper">
                                {match.bookings.budget_range}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" className="bg-gradient-hero hover:bg-copper">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
                  <p className="mb-4">Job opportunities will appear here when clients post matching work</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="p-4 border border-sand-dark/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal mb-1">
                            {app.bookings?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Submitted
                            </Badge>
                            {app.proposed_price && (
                              <span className="text-sm text-copper">
                                €{app.proposed_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p>Start applying to jobs to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;