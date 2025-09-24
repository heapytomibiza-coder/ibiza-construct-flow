import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MobileProfessionalDashboard from '@/components/professional/MobileProfessionalDashboard';
import SimpleProfessionalDashboard from '@/components/dashboards/SimpleProfessionalDashboard';

export default function ProfessionalDashboardPage() {
  const { user, profile, loading } = useAuth();
  const [simpleMode, setSimpleMode] = useState(true);
  const [featureFlagsLoading, setFeatureFlagsLoading] = useState(true);

  useEffect(() => {
    checkSimpleMode();
  }, [profile]);

  const checkSimpleMode = async () => {
    if (!profile) return;
    
    const { data: flagData } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', 'dashboard_simple_mode')
      .single();
    
    if (flagData?.enabled) {
      setSimpleMode((profile as any)?.simple_mode ?? true);
    } else {
      setSimpleMode(false);
    }
    setFeatureFlagsLoading(false);
  };

  const toggleMode = async () => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    
    if (profile) {
      await supabase
        .from('profiles')
        .update({ simple_mode: newMode })
        .eq('id', profile.id);
    }
  };

  if (loading || featureFlagsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return simpleMode ? 
    <SimpleProfessionalDashboard user={user} profile={profile} onToggleMode={toggleMode} /> :
    <MobileProfessionalDashboard user={user} profile={profile} />;
}