import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProfessionalOnboarding, OnboardingData } from '@/components/onboarding/ProfessionalOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfessionalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<Partial<OnboardingData>>();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!user) return;

      try {
        const { data: session } = await supabase
          .from('form_sessions')
          .select('payload')
          .eq('user_id', user.id)
          .eq('form_type', 'professional_onboarding')
          .single();

        if (session?.payload) {
          setInitialData(session.payload as Partial<OnboardingData>);
          toast.info('Restored your previous progress');
        }
      } catch (error) {
        // No session found, start fresh
      }
    };

    restoreSession();
  }, [user]);

  const handleComplete = async (data: OnboardingData) => {
    if (!user) {
      toast.error('Please sign in to complete onboarding');
      navigate('/auth/sign-in');
      return;
    }

    try {
      // Update profiles table with display name
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Save to professional_profiles
      const { error: professionalProfileError } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          bio: data.bio,
          skills: data.skills,
          zones: data.zones,
          hourly_rate: data.hourlyRate,
          availability: data.availability,
          verification_status: 'pending',
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (professionalProfileError) throw professionalProfileError;

      toast.success('Profile created! Welcome to the network 🎉');
      navigate('/dashboard/pro');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    }
  };

  return <ProfessionalOnboarding onComplete={handleComplete} initialData={initialData} />;
}
