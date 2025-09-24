import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import SimpleProfessionalDashboard from './SimpleProfessionalDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [dashboardMode, setDashboardMode] = useState<'simple' | 'enhanced'>('enhanced');
  const [userPreference, setUserPreference] = useState<string | null>(null);
  
  // Use props if provided, otherwise use auth context
  const user = propUser || authUser;
  const profile = propProfile || authProfile;

  useEffect(() => {
    loadUserPreference();
  }, [user]);

  const loadUserPreference = async () => {
    if (!user) return;
    
    try {
      // For now, just store preference in localStorage since professional_profiles doesn't have preferences column
      const savedPreference = localStorage.getItem(`professional_dashboard_mode_${user.id}`);
      if (savedPreference && (savedPreference === 'simple' || savedPreference === 'enhanced')) {
        setUserPreference(savedPreference);
        setDashboardMode(savedPreference as 'simple' | 'enhanced');
      } else if (enhancedDashboardEnabled) {
        setDashboardMode('enhanced');
      } else {
        setDashboardMode('simple');
      }
    } catch (error) {
      console.error('Error loading professional dashboard preference:', error);
      // Fallback to feature flag or enhanced mode (professionals get enhanced by default)
      setDashboardMode(enhancedDashboardEnabled ? 'enhanced' : 'simple');
    }
  };

  const saveDashboardPreference = async (mode: string) => {
    if (!user) return;
    
    try {
      // Store preference in localStorage for now
      localStorage.setItem(`professional_dashboard_mode_${user.id}`, mode);
      toast.success(`Switched to ${mode} dashboard`);
    } catch (error) {
      console.error('Error saving professional dashboard preference:', error);
      toast.error('Failed to save dashboard preference');
    }
  };

  const handleModeToggle = () => {
    const newMode = dashboardMode === 'simple' ? 'enhanced' : 'simple';
    setDashboardMode(newMode);
    saveDashboardPreference(newMode);
  };

  // Show loading if no user data
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
      <SimpleProfessionalDashboard
        user={user}
        profile={profile}
        onToggleMode={handleModeToggle}
      />
    );
  }

  // Default to enhanced/full dashboard
  return (
    <ProfessionalDashboard
      user={user}
      profile={profile}
    />
  );
};

export default UnifiedProfessionalDashboard;