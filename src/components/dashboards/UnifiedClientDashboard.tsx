import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDashboardPreference } from '@/hooks/useDashboardPreference';
import SimpleClientDashboard from './SimpleClientDashboard';
import EnhancedClientDashboard from './EnhancedClientDashboard';
import ClientDashboard from './ClientDashboard';

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

  // Render appropriate dashboard based on mode and feature flags
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

export default UnifiedClientDashboard;
