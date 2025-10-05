import { useNavigate } from 'react-router-dom';
import { ProfessionalOnboarding, OnboardingData } from '@/components/onboarding/ProfessionalOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfessionalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComplete = async (data: OnboardingData) => {
    if (!user) {
      toast.error('Please sign in to complete onboarding');
      navigate('/auth/sign-in');
      return;
    }

    try {
      // Save to professional_profiles
      const { error: profileError } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          bio: data.bio,
          skills: data.skills,
          hourly_rate: data.hourlyRate,
          availability: data.availability,
          portfolio_images: data.portfolioImages || [],
          experience_years: data.experience.length > 0 ? parseInt(data.experience[0]) || 0 : 0,
          verification_status: 'pending',
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast.success('Profile created! Welcome to the network');
      navigate('/dashboard/pro');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    }
  };

  const handleSkip = () => {
    toast.info('You can complete your profile later from settings');
    navigate('/dashboard/pro');
  };

  return <ProfessionalOnboarding onComplete={handleComplete} onSkip={handleSkip} />;
}
