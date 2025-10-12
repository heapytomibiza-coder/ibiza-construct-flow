import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDashboardPreference } from '@/hooks/useDashboardPreference';
import SimpleProfessionalDashboard from './SimpleProfessionalDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import { OnboardingGate } from '@/components/professional/OnboardingGate';
import { AIRecommendations } from '@/components/ai/AIRecommendations';
import { ProfessionalAnalytics } from '@/components/analytics/ProfessionalAnalytics';
import { BusinessInsights } from '@/components/analytics/BusinessInsights';
import { EventAnalyticsDashboard } from '@/components/analytics/EventAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnifiedProfessionalDashboardProps {
  user?: any;
  profile?: any;
}

const UnifiedProfessionalDashboard: React.FC<UnifiedProfessionalDashboardProps> = ({
  user: propUser,
  profile: propProfile
}) => {
  const { user: authUser, profile: authProfile } = useAuth();
  const enhancedDashboardEnabled = useFeature('enhanced_professional_dashboard');
  
  // Use props if provided, otherwise use auth context
  const user = propUser || authUser;
  const profile = propProfile || authProfile;

  const { dashboardMode, updateMode } = useDashboardPreference({
    scope: 'professional',
    defaultMode: enhancedDashboardEnabled ? 'enhanced' : 'simple'
  });

  const handleModeToggle = () => {
    const newMode = dashboardMode === 'simple' ? 'enhanced' : 'simple';
    updateMode(newMode);
  };

  // Show loading if no user data
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    );
  }

  // Wrap dashboard in OnboardingGate to handle phase-based routing
  const DashboardContent = () => {
    if (dashboardMode === 'simple') {
      return (
        <SimpleProfessionalDashboard
          user={user}
          profile={profile}
          onToggleMode={handleModeToggle}
        />
      );
    }

    return (
      <ProfessionalDashboard
        user={user}
        profile={profile}
      />
    );
  };

  return (
    <OnboardingGate userId={user.id}>
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
        
        <TabsContent value="analytics" className="space-y-4 mt-6">
          <ProfessionalAnalytics professionalId={user.id} />
          <EventAnalyticsDashboard userId={user.id} scope="user" />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <BusinessInsights userId={user.id} userType="professional" />
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          <AIRecommendations userId={user.id} userType="professional" />
        </TabsContent>
      </Tabs>
    </OnboardingGate>
  );
};

export default UnifiedProfessionalDashboard;