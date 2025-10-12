import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDashboardPreference } from '@/hooks/useDashboardPreference';
import SimpleClientDashboard from './SimpleClientDashboard';
import EnhancedClientDashboard from './EnhancedClientDashboard';
import ClientDashboard from './ClientDashboard';
import { AIRecommendations } from '@/components/ai/AIRecommendations';
import { BusinessInsights } from '@/components/analytics/BusinessInsights';
import { EventAnalyticsDashboard } from '@/components/analytics/EventAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnifiedClientDashboardProps {
  user?: any;
  profile?: any;
}

const UnifiedClientDashboard: React.FC<UnifiedClientDashboardProps> = ({
  user: propUser,
  profile: propProfile
}) => {
  const { user: authUser, profile: authProfile } = useAuth();
  const enhancedDashboardEnabled = useFeature('enhanced_client_dashboard');
  
  // Use props if provided, otherwise use auth context
  const user = propUser || authUser;
  const profile = propProfile || authProfile;

  const { dashboardMode, updateMode } = useDashboardPreference({
    scope: 'client',
    defaultMode: enhancedDashboardEnabled ? 'enhanced' : 'simple'
  });

  const handleModeToggle = () => {
    const newMode = dashboardMode === 'simple' ? 'enhanced' : 'simple';
    updateMode(newMode);
  };

  const handleClassicMode = () => {
    updateMode('classic');
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    );
  }

  // Render appropriate dashboard with tabs
  const DashboardContent = () => {
    if (dashboardMode === 'simple') {
      return (
        <SimpleClientDashboard
          user={user}
          profile={profile}
          onToggleMode={handleModeToggle}
        />
      );
    }

    if (dashboardMode === 'enhanced' && enhancedDashboardEnabled) {
      return (
        <EnhancedClientDashboard
          user={user}
          profile={profile}
        />
      );
    }

    // Fallback to classic dashboard
    return (
      <ClientDashboard
        user={user}
        profile={profile}
      />
    );
  };

  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="recommendations">AI</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="mt-6">
        <DashboardContent />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <EventAnalyticsDashboard userId={user.id} scope="user" />
      </TabsContent>
      
      <TabsContent value="insights" className="mt-6">
        <BusinessInsights userId={user.id} userType="client" />
      </TabsContent>
      
      <TabsContent value="recommendations" className="mt-6">
        <AIRecommendations userId={user.id} userType="client" />
      </TabsContent>
    </Tabs>
  );
};

export default UnifiedClientDashboard;
