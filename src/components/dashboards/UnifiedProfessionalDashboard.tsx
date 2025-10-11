import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDashboardPreference } from '@/hooks/useDashboardPreference';
import SimpleProfessionalDashboard from './SimpleProfessionalDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import { OnboardingGate } from '@/components/professional/OnboardingGate';

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
      <DashboardContent />
    </OnboardingGate>
  );
};

export default UnifiedProfessionalDashboard;