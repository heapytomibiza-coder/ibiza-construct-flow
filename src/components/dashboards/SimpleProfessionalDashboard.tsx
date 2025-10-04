import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTour } from '@/components/common/Tour';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionStatusWidget } from '@/components/marketplace/SubscriptionStatusWidget';
import { 
  Home, Briefcase, Euro, LogOut, Play, Clock, 
  CheckCircle, Star, TrendingUp, Users, Calendar,
  MessageSquare, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SimpleProfessionalDashboardProps {
  user: any;
  profile: any;
  onToggleMode: () => void;
}

const SimpleProfessionalDashboard: React.FC<SimpleProfessionalDashboardProps> = ({ 
  user, 
  profile, 
  onToggleMode 
}) => {
  const [activeTab, setActiveTab] = useState('today');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    activeJobs: 0,
    completedJobs: 0,
    rating: 0,
    newLeads: 0
  });
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  // Tour steps for first-time professionals
  const tourSteps = [
    {
      target: '[data-tour="today-tab"]',
      title: 'Your Daily Overview',
      content: 'Check your jobs for today, earnings, and quick actions all in one place.'
    },
    {
      target: '[data-tour="jobs-tab"]',
      title: 'Manage Your Jobs',
      content: 'Track all your active and upcoming jobs. Update status and communicate with clients.'
    },
    {
      target: '[data-tour="earnings-tab"]',
      title: 'Track Your Earnings',
      content: 'Monitor your income, view payment history, and manage your financial overview.'
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content: 'Start jobs, take progress photos, and update clients with just one tap.'
    }
  ];

  const { TourComponent } = useTour('professional-dashboard', tourSteps);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    // Mock data for now
    setStats({
      todayEarnings: 245.50,
      weekEarnings: 1240.75,
      activeJobs: 3,
      completedJobs: 47,
      rating: 4.8,
      newLeads: 2
    });
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'earnings', label: 'Earnings', icon: Euro }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab stats={stats} profile={profile} />;
      case 'jobs':
        return <JobsTab stats={stats} />;
      case 'earnings':
        return <EarningsTab stats={stats} />;
      default:
        return <TodayTab stats={stats} profile={profile} />;
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
              Good morning, {profile?.full_name?.split(' ')[0] || 'Pro'}! ☀️
            </h1>
            <p className="text-sm text-muted-foreground">
              {stats.activeJobs} active jobs • €{stats.todayEarnings} earned today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-hero text-white">
              ⭐ {stats.rating}
            </Badge>
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
                data-tour={`${tab.id}-tab`}
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

// Today Tab Component
const TodayTab = ({ stats, profile }: any) => (
  <div className="space-y-6">
    {/* Subscription Status */}
    <SubscriptionStatusWidget />
    
    {/* Quick Actions */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-tour="quick-actions">
      <Button className="h-auto p-4 flex flex-col gap-2 bg-gradient-hero hover:bg-copper text-white">
        <Play className="w-6 h-6" />
        <span className="text-sm">Start Job</span>
      </Button>
      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
        <Camera className="w-6 h-6" />
        <span className="text-sm">Take Photo</span>
      </Button>
      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
        <MessageSquare className="w-6 h-6" />
        <span className="text-sm">Update Client</span>
      </Button>
      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
        <Calendar className="w-6 h-6" />
        <span className="text-sm">Schedule</span>
      </Button>
    </div>

    {/* Today's Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">{stats.activeJobs}</div>
          <p className="text-xs text-muted-foreground">Active Jobs</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Euro className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">€{stats.todayEarnings}</div>
          <p className="text-xs text-muted-foreground">Today</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">{stats.newLeads}</div>
          <p className="text-xs text-muted-foreground">New Leads</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Star className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">{stats.rating}</div>
          <p className="text-xs text-muted-foreground">Rating</p>
        </CardContent>
      </Card>
    </div>

    {/* Today's Jobs */}
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-sand-light rounded-lg">
            <div className="w-10 h-10 bg-copper/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-copper" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-charcoal">Kitchen Renovation - Phase 2</h4>
              <p className="text-sm text-muted-foreground">Maria Santos • 9:00 AM - 4:00 PM</p>
            </div>
            <Badge variant="secondary">In Progress</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-sand-light rounded-lg">
            <div className="w-10 h-10 bg-copper/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-copper" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-charcoal">Bathroom Tiles Installation</h4>
              <p className="text-sm text-muted-foreground">John Davidson • 2:00 PM - 6:00 PM</p>
            </div>
            <Badge variant="outline">Scheduled</Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Weekly Progress */}
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-charcoal">€{stats.weekEarnings}</div>
            <p className="text-sm text-muted-foreground">Earned</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-charcoal">{stats.completedJobs}</div>
            <p className="text-sm text-muted-foreground">Jobs Done</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-charcoal">28h</div>
            <p className="text-sm text-muted-foreground">Hours Worked</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Jobs Tab Component
const JobsTab = ({ stats }: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-charcoal">My Jobs</h2>
      <Badge variant="secondary">{stats.activeJobs} Active</Badge>
    </div>
    
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-charcoal">Kitchen Renovation - Phase 2</h3>
              <p className="text-sm text-muted-foreground">Maria Santos • Started 3 days ago</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-sand-light rounded-full h-2">
                  <div className="bg-gradient-hero h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-xs text-muted-foreground">65%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge variant="secondary">In Progress</Badge>
              <Button variant="ghost" size="sm">
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-charcoal">Bathroom Tiles Installation</h3>
              <p className="text-sm text-muted-foreground">John Davidson • Starts today 2:00 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Scheduled</Badge>
              <Button variant="ghost" size="sm">
                Start
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-charcoal">Garden Landscaping Quote</h3>
              <p className="text-sm text-muted-foreground">Sarah Williams • Quote requested</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Quote Pending</Badge>
              <Button variant="ghost" size="sm">
                Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Earnings Tab Component
const EarningsTab = ({ stats }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">€{stats.todayEarnings}</div>
          <p className="text-sm text-muted-foreground">Today</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <Euro className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">€{stats.weekEarnings}</div>
          <p className="text-sm text-muted-foreground">This Week</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-charcoal">€3,420</div>
          <p className="text-sm text-muted-foreground">This Month</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-sand-light rounded-lg">
            <div>
              <h4 className="font-medium text-charcoal">Kitchen Renovation - Milestone 1</h4>
              <p className="text-sm text-muted-foreground">Maria Santos • Completed yesterday</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-charcoal">€850.00</div>
              <Badge variant="default" className="text-xs">Paid</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-sand-light rounded-lg">
            <div>
              <h4 className="font-medium text-charcoal">Plumbing Repair</h4>
              <p className="text-sm text-muted-foreground">Robert Johnson • 2 days ago</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-charcoal">€245.50</div>
              <Badge variant="default" className="text-xs">Paid</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-sand-light rounded-lg">
            <div>
              <h4 className="font-medium text-charcoal">Electrical Installation</h4>
              <p className="text-sm text-muted-foreground">Lisa Martinez • 5 days ago</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-charcoal">€1,150.00</div>
              <Badge variant="secondary" className="text-xs">Processing</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SimpleProfessionalDashboard;