import React, { lazy, Suspense, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDashboardPreference } from '@/hooks/useDashboardPreference';
import SimpleProfessionalDashboard from './SimpleProfessionalDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import { OnboardingGate } from '@/components/professional/OnboardingGate';
import { EnhancedNotificationCenter } from '@/components/notifications/EnhancedNotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardLoader } from '@/components/common/LoadingStates';

// Lazy load heavy components
const AIRecommendations = lazy(() => import('@/components/ai/AIRecommendations').then(m => ({ default: m.AIRecommendations })));
const ProfessionalAnalytics = lazy(() => import('@/components/analytics/ProfessionalAnalytics').then(m => ({ default: m.ProfessionalAnalytics })));
const BusinessInsights = lazy(() => import('@/components/analytics/BusinessInsights').then(m => ({ default: m.BusinessInsights })));
const EventAnalyticsDashboard = lazy(() => import('@/components/analytics/EventAnalyticsDashboard').then(m => ({ default: m.EventAnalyticsDashboard })));
const ProfessionalFeaturesShowcase = lazy(() => import('@/components/professional/ProfessionalFeaturesShowcase').then(m => ({ default: m.ProfessionalFeaturesShowcase })));

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
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
      <div className="flex items-center justify-end mb-4">
        <EnhancedNotificationCenter userId={user.id} />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">AI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <DashboardContent />
        </TabsContent>
        
        {activeTab === 'features' && (
          <TabsContent value="features" className="mt-6">
            <Suspense fallback={<CardLoader />}>
              <ProfessionalFeaturesShowcase />
            </Suspense>
          </TabsContent>
        )}
        
        {activeTab === 'analytics' && (
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Suspense fallback={<CardLoader />}>
              <ProfessionalAnalytics professionalId={user.id} />
              <EventAnalyticsDashboard userId={user.id} scope="user" />
            </Suspense>
          </TabsContent>
        )}
        
        {activeTab === 'insights' && (
          <TabsContent value="insights" className="mt-6">
            <Suspense fallback={<CardLoader />}>
              <BusinessInsights userId={user.id} userType="professional" />
            </Suspense>
          </TabsContent>
        )}
        
        {activeTab === 'recommendations' && (
          <TabsContent value="recommendations" className="mt-6">
            <Suspense fallback={<CardLoader />}>
              <AIRecommendations userId={user.id} userType="professional" />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </OnboardingGate>
  );
};

export default UnifiedProfessionalDashboard;