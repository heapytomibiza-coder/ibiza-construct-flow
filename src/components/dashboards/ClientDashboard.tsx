import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useServices } from '@/hooks/useServices';
import { 
  LogOut, Plus, Clock, CheckCircle, AlertCircle, 
  Briefcase, Calendar, Euro, TrendingUp 
} from 'lucide-react';
import { toast } from 'sonner';

const ClientDashboard = ({ user, profile }: any) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const { getServiceCards } = useServices();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id (
            category,
            subcategory,
            micro
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBookings(data || []);
      
      // Calculate stats
      const stats = (data || []).reduce(
        (acc, booking) => {
          switch (booking.status) {
            case 'in_progress':
              acc.active++;
              break;
            case 'completed':
              acc.completed++;
              break;
            case 'draft':
            case 'posted':
            case 'matched':
              acc.pending++;
              break;
          }
          return acc;
        },
        { active: 0, completed: 0, pending: 0, totalSpent: 0 }
      );
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
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
            <h1 className="text-2xl font-bold text-foreground">Client Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Client</Badge>
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
              <Clock className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Jobs in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Finished projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">€{stats.totalSpent}</div>
              <p className="text-xs text-muted-foreground">Total invested</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Jobs
                <Button size="sm" className="bg-gradient-hero hover:bg-copper">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-sand-dark/20 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal">{booking.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.services?.category} • {booking.services?.micro}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'in_progress' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {booking.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {booking.budget_range && (
                          <div className="text-sm font-medium text-copper">
                            {booking.budget_range}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
                  <p className="mb-4">Get started by posting your first job</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-gradient-hero hover:bg-copper" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Euro className="w-4 h-4 mr-2" />
                  View Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;