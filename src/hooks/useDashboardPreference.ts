import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type DashboardMode = 'simple' | 'enhanced' | 'classic';

interface UseDashboardPreferenceProps {
  userId: string;
  preferenceKey: string; // e.g., 'client_dashboard_mode' or 'professional_dashboard_mode'
  defaultMode?: DashboardMode;
}

export function useDashboardPreference({ 
  userId, 
  preferenceKey, 
  defaultMode = 'enhanced' 
}: UseDashboardPreferenceProps) {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(defaultMode);
  const [userPreference, setUserPreference] = useState<string | null>(null);

  useEffect(() => {
    loadUserPreference();
  }, [userId]);

  const loadUserPreference = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const preferences = data?.preferences as any || {};
      const savedMode = preferences[preferenceKey];
      
      if (savedMode && ['simple', 'enhanced', 'classic'].includes(savedMode)) {
        setUserPreference(savedMode);
        setDashboardMode(savedMode as DashboardMode);
      }
    } catch (error) {
      console.error('Error loading dashboard preference:', error);
    }
  };

  const updateDashboardMode = async (newMode: DashboardMode) => {
    try {
      // Get current preferences
      const { data: currentData, error: fetchError } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentPreferences = (currentData?.preferences as any) || {};
      const updatedPreferences = {
        ...currentPreferences,
        [preferenceKey]: newMode
      };

      // Update with new mode
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', userId);

      if (updateError) throw updateError;

      setDashboardMode(newMode);
      setUserPreference(newMode);

      toast.success(`Dashboard mode set to ${newMode}`);
    } catch (error) {
      console.error('Error updating dashboard preference:', error);
      toast.error('Failed to update dashboard preference');
    }
  };

  return {
    dashboardMode,
    userPreference,
    updateDashboardMode,
    setDashboardMode
  };
}
