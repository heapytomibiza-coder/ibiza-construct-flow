import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTour } from '@/components/common/Tour';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Users, 
  Clock,
  FileText,
  CreditCard,
  MessageSquare,
  Plus,
  ChevronRight,
  BarChart3,
  Settings,
  Search,
  CheckCircle,
  AlertCircle,
  Euro,
  LogOut,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useConversationList } from '@/hooks/useConversationList';

interface SimpleClientDashboardProps {
  user: any;
  profile: any;
  onToggleMode: () => void;
}

const SimpleClientDashboard: React.FC<SimpleClientDashboardProps> = ({ 
  user, 
  profile, 
  onToggleMode 
}) => {
  const navigate = useNavigate();
  const { totalUnread } = useConversationList(user?.id);
  const [activeTab, setActiveTab] = useState('home');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  // Tour steps for first-time users
  const tourSteps = [
    {
      target: '[data-tour="post-job"]',
      title: 'Post Your First Job',
      content: 'Start by posting a job to get quotes from trusted professionals in your area.'
    },
    {
      target: '[data-tour="jobs-tab"]',
      title: 'Track Your Jobs',
      content: 'Monitor all your active and completed projects in one place.'
    },
    {
      target: '[data-tour="messages"]',
      title: 'Stay Connected',
      content: 'Chat directly with professionals and track all communications.'
    },
    {
      target: '[data-tour="payments"]',
      title: 'Secure Payments',
      content: 'Handle all payments safely with our escrow protection system.'
    }
  ];

  const { TourComponent } = useTour('client-dashboard', tourSteps);

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

  const tabs = [
    { id: 'home', label: 'Home', icon: Clock },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase, tourTarget: 'jobs-tab' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, tourTarget: 'messages-tab' },
    { id: 'payments', label: 'Payments', icon: Euro }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab stats={stats} bookings={bookings} onTabChange={setActiveTab} navigate={navigate} />;
      case 'jobs':
        return <JobsTab bookings={bookings} loading={loading} />;
      case 'messages':
        return <MessagesTab />;
      case 'payments':
        return <PaymentsTab />;
      default:
        return <HomeTab stats={stats} bookings={bookings} onTabChange={setActiveTab} navigate={navigate} />;
    }
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
      <TourComponent />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Hi {profile?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-sm text-muted-foreground">What would you like to do today?</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onToggleMode}>
              Advanced View
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tour={tab.tourTarget}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === tab.id
                    ? "text-copper border-b-2 border-copper bg-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-4xl mx-auto p-4">
        {renderTabContent()}
      </main>
    </div>
  );
};

// Home Tab Component
const HomeTab = ({ stats, bookings, onTabChange, navigate }: any) => (
  <div className="space-y-6">
    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="card-luxury">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal">Need Help With Something?</h3>
              <p className="text-sm text-muted-foreground">Post a job and get quotes from trusted pros</p>
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-gradient-hero hover:bg-copper text-white"
            data-tour="post-job"
            onClick={() => navigate('/post')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post a Job
          </Button>
        </CardContent>
      </Card>

      <Card className="card-luxury">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-copper/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-copper" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal">Browse Professionals</h3>
              <p className="text-sm text-muted-foreground">Find and compare local experts</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Users className="w-4 h-4 mr-2" />
            Find Pros
          </Button>
        </CardContent>
      </Card>
    </div>

    {/* Stats Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">{stats.active}</div>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">Pending</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">€{stats.totalSpent}</div>
          <p className="text-xs text-muted-foreground">Spent</p>
        </CardContent>
      </Card>
    </div>

    {/* Recent Activity */}
    {bookings.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Activity
            <Button variant="ghost" size="sm" onClick={() => onTabChange('jobs')}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking: any) => (
              <div key={booking.id} className="flex items-center gap-3 p-3 bg-sand-light rounded-lg">
                <div className="w-10 h-10 bg-copper/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-copper" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-charcoal">{booking.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {booking.services?.category} • {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={
                  booking.status === 'completed' ? 'default' :
                  booking.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Jobs Tab Component  
const JobsTab = ({ bookings, loading }: any) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal">My Jobs</h2>
        <Button 
          size="sm" 
          className="bg-gradient-hero hover:bg-copper text-white" 
          data-tour="post-job"
          onClick={() => navigate('/post')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>
    
    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper mx-auto"></div>
      </div>
    ) : bookings.length > 0 ? (
      <div className="space-y-3">
        {bookings.map((booking: any) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-charcoal">{booking.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.services?.category} • {booking.services?.micro}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    booking.status === 'completed' ? 'default' :
                    booking.status === 'in_progress' ? 'secondary' : 'outline'
                  }>
                    {booking.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal mb-2">No jobs yet</h3>
          <p className="text-muted-foreground mb-4">Get started by posting your first job</p>
          <Button 
            className="bg-gradient-hero hover:bg-copper text-white"
            onClick={() => navigate('/post')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Your First Job
          </Button>
        </CardContent>
      </Card>
    )}
    </div>
  );
};

// Messages Tab Component
const MessagesTab = () => (
  <div className="space-y-4" data-tour="messages">
    <h2 className="text-lg font-semibold text-charcoal">Messages</h2>
    <Card>
      <CardContent className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">No messages yet</h3>
        <p className="text-muted-foreground">Messages with professionals will appear here</p>
      </CardContent>
    </Card>
  </div>
);

// Payments Tab Component
const PaymentsTab = () => (
  <div className="space-y-4" data-tour="payments">
    <h2 className="text-lg font-semibold text-charcoal">Payments & Invoices</h2>
    <Card>
      <CardContent className="p-8 text-center">
        <Euro className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">No payments yet</h3>
        <p className="text-muted-foreground">Payment history and invoices will appear here</p>
      </CardContent>
    </Card>
  </div>
);

export default SimpleClientDashboard;