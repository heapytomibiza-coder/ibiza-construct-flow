import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import SimpleClientDashboard from './SimpleClientDashboard';
import EnhancedClientDashboard from './EnhancedClientDashboard';
import ClientDashboard from './ClientDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [dashboardMode, setDashboardMode] = useState<'simple' | 'enhanced' | 'classic'>('enhanced');
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
      const { data, error } = await supabase
        .from('client_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (data?.preferences && typeof data.preferences === 'object' && data.preferences !== null) {
        const prefs = data.preferences as { dashboard_mode?: string };
        if (prefs.dashboard_mode) {
          const savedMode = prefs.dashboard_mode;
          setUserPreference(savedMode);
          setDashboardMode(savedMode as 'simple' | 'enhanced' | 'classic');
        }
      } else if (enhancedDashboardEnabled) {
        setDashboardMode('enhanced');
      } else {
        setDashboardMode('simple');
      }
    } catch (error) {
      console.error('Error loading dashboard preference:', error);
      // Fallback to feature flag or simple mode
      setDashboardMode(enhancedDashboardEnabled ? 'enhanced' : 'simple');
    }
  };

  const saveDashboardPreference = async (mode: string) => {
    if (!user) return;
    
    try {
      const { data: existingProfile } = await supabase
        .from('client_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      const currentPreferences = (existingProfile?.preferences && 
        typeof existingProfile.preferences === 'object' && 
        existingProfile.preferences !== null) 
        ? existingProfile.preferences as Record<string, any> 
        : {};
        
      const updatedPreferences = {
        ...currentPreferences,
        dashboard_mode: mode
      };

      const { error } = await supabase
        .from('client_profiles')
        .upsert({
          user_id: user.id,
          preferences: updatedPreferences
        });

      if (error) throw error;
      
      toast.success(`Switched to ${mode} dashboard`);
    } catch (error) {
      console.error('Error saving dashboard preference:', error);
      toast.error('Failed to save dashboard preference');
    }
  };

  const handleModeToggle = () => {
    const newMode = dashboardMode === 'simple' ? 'enhanced' : 'simple';
    setDashboardMode(newMode);
    saveDashboardPreference(newMode);
  };

  const handleClassicMode = () => {
    setDashboardMode('classic');
    saveDashboardPreference('classic');
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