import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { OnboardingGate } from '@/components/professional/OnboardingGate';
import { EnhancedNotificationCenter } from '@/components/notifications/EnhancedNotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardLoader } from '@/components/common/LoadingStates';
import { 
  Briefcase, Star, Euro, TrendingUp, Plus, 
  Sparkles, BarChart3, ChevronRight, Clock, CheckCircle
} from 'lucide-react';
import { VerificationStatusCard } from '@/components/professional/VerificationStatusCard';
import { ProfileCompletionTracker } from '@/components/professional/ProfileCompletionTracker';
import { SubscriptionStatusWidget } from '@/components/marketplace/SubscriptionStatusWidget';

// Lazy load heavy components
const AIRecommendations = lazy(() => import('@/components/ai/AIRecommendations').then(m => ({ default: m.AIRecommendations })));
const BusinessInsights = lazy(() => import('@/components/analytics/BusinessInsights').then(m => ({ default: m.BusinessInsights })));

interface UnifiedProfessionalDashboardProps {
  user?: any;
  profile?: any;
}

const UnifiedProfessionalDashboard: React.FC<UnifiedProfessionalDashboardProps> = ({
  user: propUser,
  profile: propProfile
}) => {
  const { user: authUser, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  
  // Use props if provided, otherwise use auth context
  const user = propUser || authUser;
  const profile = propProfile || authProfile;

  // Show loading if no user data
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    );
  }

  // Mock stats - replace with real data
  const stats = {
    availableJobs: 5,
    interested: 0,
    thisMonth: 0,
    profileScore: 85
  };

  return (
    <OnboardingGate userId={user.id}>
      <div className="min-h-screen bg-background">
        {/* Header with notification */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Home</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.full_name || 'Professional'}
            </p>
          </div>
          <EnhancedNotificationCenter userId={user.id} />
        </div>

        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome back, Professional!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your marketplace is ready to help you grow your business.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/jobs')} className="bg-primary hover:bg-primary/90">
                Browse Jobs
              </Button>
              <Button variant="outline" onClick={() => navigate('/services')}>
                My Services
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableJobs}</div>
              <p className="text-xs text-muted-foreground">Matches your skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interested</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interested}</div>
              <p className="text-xs text-muted-foreground">Pending quotes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">Total invested</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileScore}%</div>
              <p className="text-xs text-muted-foreground">Completeness</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Continue Your Journey */}
          <div className="lg:col-span-2 space-y-6">
            {/* Verification & Profile */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Continue Your Journey
              </h2>
              <div className="space-y-4">
                <VerificationStatusCard userId={user.id} />
                <ProfileCompletionTracker profile={profile} />
                <SubscriptionStatusWidget />
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/services/create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/quotes')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Manage Quotes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/calendar')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Job Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
                  <p className="mb-4">Job opportunities matching your services will appear here</p>
                  <Button onClick={() => navigate('/jobs')}>
                    Browse Available Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Suspense fallback={<CardLoader />}>
                  <BusinessInsights userId={user.id} userType="professional" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Features & Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore professional features to help grow your business
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/features')}
                >
                  View All Features
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your business performance and growth
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OnboardingGate>
  );
};

export default UnifiedProfessionalDashboard;