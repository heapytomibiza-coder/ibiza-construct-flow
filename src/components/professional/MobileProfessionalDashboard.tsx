import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { OfflineIndicator } from './OfflineIndicator';
import { GamificationPanel } from './GamificationPanel';
import { RealtimeNotifications } from './RealtimeNotifications';
import { 
  Home, Users, Briefcase, Calendar, DollarSign, 
  Star, User, Shield, Settings, Plus, Play, 
  Camera, Mic, Quote, Edit, MapPin, Clock,
  TrendingUp, Target, Zap
} from 'lucide-react';
import { TodayScreen } from './screens/TodayScreen';
import { LeadsScreen } from './screens/LeadsScreen';
import { MyJobsScreen } from './screens/MyJobsScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { EarningsScreen } from './screens/EarningsScreen';
import { ReviewsScreen } from './screens/ReviewsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ComplianceScreen } from './screens/ComplianceScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { AIIntegrationTest } from './AIIntegrationTest';

interface MobileProfessionalDashboardProps {
  user: any;
  profile: any;
}

type Screen = 'today' | 'leads' | 'jobs' | 'schedule' | 'earnings' | 'reviews' | 'profile' | 'compliance' | 'tools';

export default function MobileProfessionalDashboard({ user, profile }: MobileProfessionalDashboardProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>('today');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    activeJobs: 0,
    completedJobs: 0,
    rating: 0,
    responseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setStats({
      todayEarnings: 245.50,
      weekEarnings: 1240.75,
      activeJobs: 3,
      completedJobs: 47,
      rating: 4.8,
      responseTime: 12
    });
    setLoading(false);
  };

  const navigationItems = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'tools', label: 'Tools', icon: Settings }
  ];

  const fabActions = [
    { label: 'Start Job', icon: Play },
    { label: 'Take Photo', icon: Camera },
    { label: 'Voice Note', icon: Mic },
    { label: 'Quick Quote', icon: Quote }
  ];

  const handleFabAction = (action: string) => {
    toast.info(`${action} - Coming soon!`);
  };

  const renderScreen = () => {
    const screenProps = { user, profile, stats };
    
    switch (activeScreen) {
      case 'today':
        return <TodayScreen {...screenProps} />;
      case 'leads':
        return <LeadsScreen {...screenProps} />;
      case 'jobs':
        return <MyJobsScreen {...screenProps} />;
      case 'schedule':
        return <ScheduleScreen {...screenProps} />;
      case 'earnings':
        return <EarningsScreen {...screenProps} />;
      case 'reviews':
        return <ReviewsScreen {...screenProps} />;
      case 'profile':
        return <ProfileScreen {...screenProps} />;
      case 'compliance':
        return <ComplianceScreen {...screenProps} />;
      case 'tools':
        return <ToolsScreen {...screenProps} />;
      default:
        return <TodayScreen {...screenProps} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-card border-r border-border p-6">
          <div className="space-y-2 mb-6">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeScreen === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveScreen(item.id as Screen)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
          
          <GamificationPanel userId={user?.id} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden">
            <header className="bg-background border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <div className="flex items-center gap-2">
                  <RealtimeNotifications userId={user?.id} />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {navigationItems.map((item) => (
                            <Button
                              key={item.id}
                              variant={activeScreen === item.id ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setActiveScreen(item.id as Screen)}
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.label}
                            </Button>
                          ))}
                        </div>
                        <Separator />
                        <GamificationPanel userId={user?.id} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </header>
          </div>

          {/* Screen Content */}
          <div className="flex-1 p-4">
            {activeScreen === 'today' && <AIIntegrationTest />}
            {renderScreen()}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden">
            <nav className="bg-background border-t border-border p-2">
              <div className="flex justify-around items-center">
                {navigationItems.slice(0, 4).map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="flex flex-col gap-1 h-auto"
                    onClick={() => setActiveScreen(item.id as Screen)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </nav>

            {/* Floating Action Button */}
            <div className="fixed bottom-20 right-4 z-50">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="rounded-full w-14 h-14 shadow-lg">
                    <Plus className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <div className="grid grid-cols-2 gap-4 py-6">
                    {fabActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        className="flex flex-col gap-2 h-auto py-4"
                        onClick={() => handleFabAction(action.label)}
                      >
                        <action.icon className="w-6 h-6" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}