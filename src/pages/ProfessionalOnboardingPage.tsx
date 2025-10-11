import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { IntroOnboarding, IntroData } from '@/components/onboarding/IntroOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfessionalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: IntroData) => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }

    setIsLoading(true);
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

      // Create/update professional profile with Phase 1 data
      const { error: professionalProfileError } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          bio: data.bio,
          intro_categories: data.categories, // High-level categories
          service_regions: data.regions,
          availability: data.availability,
          onboarding_phase: 'intro_submitted',
          verification_status: 'pending',
          is_active: false, // Not live until service_configured
          updated_at: new Date().toISOString()
        });

      if (professionalProfileError) throw professionalProfileError;

      toast.success('Thanks! Next: Upload your verification docs', {
        duration: 4000,
      });
      
      // Route to dashboard, which will show the OnboardingGate
      navigate('/dashboard/pro');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to submit');
    } finally {
      setIsLoading(false);
    }
  };

  return <IntroOnboarding onSubmit={handleSubmit} isLoading={isLoading} />;
}
