import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  Home, Plus, Users, Briefcase, MessageSquare, FileText, 
  CreditCard, MapPin, Heart, Bell, HelpCircle, Clock, 
  CheckCircle, AlertCircle, TrendingUp, LogOut, Sparkles,
  Search, Filter, Map
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AIAssistantRail } from '@/components/ai/AIAssistantRail';
import { ClientJobsView } from '@/components/client/ClientJobsView';
import { CompareProsView } from '@/components/client/CompareProsView';
import { ClientMessagesView } from '@/components/client/ClientMessagesView';
import { ClientFilesView } from '@/components/client/ClientFilesView';
import { ClientPaymentsView } from '@/components/client/ClientPaymentsView';
import { ClientPropertiesView } from '@/components/client/ClientPropertiesView';
import { ClientFavoritesView } from '@/components/client/ClientFavoritesView';
import { ClientNotificationsView } from '@/components/client/ClientNotificationsView';

const navigationItems = [
  { 
    title: 'Main',
    items: [
      { title: 'Home', icon: Home, id: 'home' },
      { title: 'Post a Job', icon: Plus, id: 'post-job' },
      { title: 'Compare Pros', icon: Users, id: 'compare-pros' },
      { title: 'My Jobs', icon: Briefcase, id: 'my-jobs' }
    ]
  },
  {
    title: 'Communication',
    items: [
      { title: 'Messages', icon: MessageSquare, id: 'messages' },
      { title: 'Files', icon: FileText, id: 'files' }
    ]
  },
  {
    title: 'Financial',
    items: [
      { title: 'Payments & Invoices', icon: CreditCard, id: 'payments' }
    ]
  },
  {
    title: 'Settings',
    items: [
      { title: 'Properties', icon: MapPin, id: 'properties' },
      { title: 'Favorites', icon: Heart, id: 'favorites' },
      { title: 'Notifications', icon: Bell, id: 'notifications' },
      { title: 'Help', icon: HelpCircle, id: 'help' }
    ]
  }
];

interface EnhancedClientDashboardProps {
  user: any;
  profile: any;
}

const ClientSidebar = ({ activeView, onViewChange }: { activeView: string; onViewChange: (view: string) => void }) => {
  const sidebar = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!sidebar.open && (
              <div>
                <h2 className="font-display font-semibold text-sidebar-foreground">Client Hub</h2>
                <p className="text-xs text-sidebar-foreground/60">AI-Powered Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-sidebar-foreground/60">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        activeView === item.id 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

const EnhancedClientDashboard = ({ user, profile }: EnhancedClientDashboardProps) => {
  const [activeView, setActiveView] = useState('home');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchBookings();
    fetchAISuggestions();
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

  const fetchAISuggestions = async () => {
    // Mock AI suggestions for now
    setTimeout(() => {
      setAiSuggestions([
        {
          type: 'scope-improvement',
          title: 'Improve Your Job Scope',
          description: 'Add 3 missing details to your bathroom renovation project for better quotes',
          action: 'Fix Scope',
          confidence: 85
        },
        {
          type: 'budget-optimization',
          title: 'Budget Alert',
          description: 'Similar plumbing jobs in your area cost 15% less on average',
          action: 'Compare Prices',
          confidence: 92
        },
        {
          type: 'pro-recommendation',
          title: 'Top Pro Available',
          description: 'Maria Santos (4.9★) has availability next week for your electrical work',
          action: 'View Profile',
          confidence: 88
        }
      ]);
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView stats={stats} bookings={bookings} user={user} profile={profile} onViewChange={setActiveView} />;
      case 'post-job':
        return <div className="p-6">Post Job Wizard Coming Soon</div>;
      case 'compare-pros':
        return <CompareProsView />;
      case 'my-jobs':
        return <ClientJobsView bookings={bookings} loading={loading} />;
      case 'messages':
        return <ClientMessagesView />;
      case 'files':
        return <ClientFilesView />;
      case 'payments':
        return <ClientPaymentsView />;
      case 'properties':
        return <ClientPropertiesView />;
      case 'favorites':
        return <ClientFavoritesView />;
      case 'notifications':
        return <ClientNotificationsView />;
      case 'help':
        return <div className="p-6">Help & Support Coming Soon</div>;
      default:
        return <HomeView stats={stats} bookings={bookings} user={user} profile={profile} onViewChange={setActiveView} />;
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ClientSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {navigationItems.flatMap(g => g.items).find(item => item.id === activeView)?.title || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome back, {profile?.full_name || user?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-gradient-hero text-white">
                  Premium Client
                </Badge>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content with AI Rail */}
          <div className="flex-1 flex">
            <main className="flex-1 overflow-auto">
              {renderMainContent()}
            </main>
            
            <AIAssistantRail 
              suggestions={aiSuggestions}
              userContext={{ activeView, stats, bookings }}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Home View Component
const HomeView = ({ stats, bookings, user, profile, onViewChange }: any) => {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-6 text-white">
        <h2 className="text-2xl font-display font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h2>
        <p className="text-white/90 mb-4">
          Your AI-powered construction marketplace is ready to help you find the perfect professionals.
        </p>
        <div className="flex gap-3">
          <Button 
            className="bg-white text-charcoal hover:bg-white/90"
            onClick={() => onViewChange('post-job')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
            onClick={() => onViewChange('compare-pros')}
          >
            <Search className="w-4 h-4 mr-2" />
            Find Professionals
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-copper" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Jobs in progress</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-copper" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-copper" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-charcoal">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting quotes</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
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

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Your Journey */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-copper" />
              Continue Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start bg-gradient-hero hover:bg-copper text-white"
              onClick={() => onViewChange('post-job')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Fix My Scope
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onViewChange('compare-pros')}
            >
              <Users className="w-4 h-4 mr-2" />
              Get 3 Quotes
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onViewChange('my-jobs')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Check Job Status
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-sand-light rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal text-sm">{booking.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {booking.services?.category}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">No jobs yet</p>
                <Button 
                  size="sm" 
                  className="mt-2 bg-gradient-hero text-white"
                  onClick={() => onViewChange('post-job')}
                >
                  Start Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="card-luxury border-copper/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-copper" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-copper/5 rounded-lg border-l-2 border-copper">
                <p className="text-sm font-medium text-charcoal">Market Insight</p>
                <p className="text-xs text-muted-foreground">
                  Electrical work prices decreased 8% this month in your area
                </p>
              </div>
              <div className="p-3 bg-copper/5 rounded-lg border-l-2 border-copper">
                <p className="text-sm font-medium text-charcoal">Availability Alert</p>
                <p className="text-xs text-muted-foreground">
                  3 top-rated plumbers available next week
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-copper text-copper hover:bg-copper/5"
              >
                View All Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedClientDashboard;