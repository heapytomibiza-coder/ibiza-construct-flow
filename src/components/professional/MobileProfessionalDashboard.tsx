import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, Users, Briefcase, Calendar, DollarSign, 
  Star, User, Shield, Settings, Plus, Play, 
  Camera, Mic, Quote, Edit, MapPin, Clock,
  TrendingUp, Target, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { TodayScreen } from './screens/TodayScreen';
import { LeadsScreen } from './screens/LeadsScreen';
import { MyJobsScreen } from './screens/MyJobsScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { EarningsScreen } from './screens/EarningsScreen';
import { ReviewsScreen } from './screens/ReviewsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ComplianceScreen } from './screens/ComplianceScreen';
import { ToolsScreen } from './screens/ToolsScreen';

interface MobileProfessionalDashboardProps {
  user: any;
  profile: any;
}

type Screen = 'today' | 'leads' | 'jobs' | 'schedule' | 'earnings' | 'reviews' | 'profile' | 'compliance' | 'tools';

const MobileProfessionalDashboard = ({ user, profile }: MobileProfessionalDashboardProps) => {
  const [activeScreen, setActiveScreen] = useState<Screen>('today');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weeklyTarget: 1000,
    nextJob: null,
    activeJobs: 0,
    newLeads: 0,
    rating: 4.8,
    weekFill: 0.75,
    onTimeStreak: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Fetch professional stats and data
      // This would be implemented with the new schema
      setStats({
        todayEarnings: 280,
        weeklyTarget: 1000,
        nextJob: {
          id: '1',
          title: 'Kitchen Installation',
          eta: '14:30',
          address: '123 Main St',
          distance: '2.1 km'
        },
        activeJobs: 3,
        newLeads: 7,
        rating: 4.8,
        weekFill: 0.75,
        onTimeStreak: 5
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'today', icon: Home, label: 'Today', badge: null },
    { id: 'leads', icon: Users, label: 'Leads', badge: stats.newLeads },
    { id: 'jobs', icon: Briefcase, label: 'My Jobs', badge: stats.activeJobs },
    { id: 'schedule', icon: Calendar, label: 'Schedule', badge: null },
    { id: 'earnings', icon: DollarSign, label: 'Earnings', badge: null },
    { id: 'reviews', icon: Star, label: 'Reviews', badge: null },
    { id: 'profile', icon: User, label: 'Profile', badge: null },
    { id: 'compliance', icon: Shield, label: 'Compliance', badge: null },
    { id: 'tools', icon: Settings, label: 'Tools', badge: null },
  ];

  const fabActions = [
    { icon: Play, label: 'Start Job', action: () => handleFabAction('start-job') },
    { icon: Camera, label: 'Add Photos', action: () => handleFabAction('photos') },
    { icon: Mic, label: 'Voice Note', action: () => handleFabAction('voice') },
    { icon: Quote, label: 'Quick Quote', action: () => handleFabAction('quote') },
    { icon: Edit, label: 'Variation', action: () => handleFabAction('variation') }
  ];

  const handleFabAction = (action: string) => {
    toast.info(`${action} feature coming soon!`);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'today':
        return <TodayScreen stats={stats} user={user} />;
      case 'leads':
        return <LeadsScreen user={user} />;
      case 'jobs':
        return <MyJobsScreen user={user} />;
      case 'schedule':
        return <ScheduleScreen user={user} />;
      case 'earnings':
        return <EarningsScreen user={user} stats={stats} />;
      case 'reviews':
        return <ReviewsScreen user={user} />;
      case 'profile':
        return <ProfileScreen user={user} profile={profile} />;
      case 'compliance':
        return <ComplianceScreen user={user} />;
      case 'tools':
        return <ToolsScreen user={user} />;
      default:
        return <TodayScreen stats={stats} user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden">
        <header className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                {navigationItems.find(item => item.id === activeScreen)?.label}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">Pro</Badge>
            </div>
          </div>
        </header>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <nav className="w-64 bg-background border-r border-border min-h-screen">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">Professional Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {profile?.full_name || user?.email}
            </p>
          </div>
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeScreen === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveScreen(item.id as Screen)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {renderScreen()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeScreen === item.id ? 'default' : 'ghost'}
                size="sm"
                className="flex flex-col h-12 relative"
                onClick={() => setActiveScreen(item.id as Screen)}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 md:bottom-4 md:right-6 z-50">
        <div className="relative group">
          {/* FAB Actions (expand on hover/tap) */}
          <div className="absolute bottom-16 right-0 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {fabActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  size="sm"
                  variant="secondary"
                  className="w-12 h-12 rounded-full shadow-lg"
                  onClick={action.action}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
          
          {/* Main FAB */}
          <Button
            size="lg"
            className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileProfessionalDashboard;