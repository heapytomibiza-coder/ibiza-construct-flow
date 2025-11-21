import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProfessionalOnboardingWizard, OnboardingData } from '@/components/onboarding/wizard/ProfessionalOnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfessionalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: OnboardingData) => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      let coverImageUrl = data.coverImageUrl;

      // Upload cover image if provided
      if (data.coverImageUrl && data.coverImageUrl.startsWith('blob:')) {
        const response = await fetch(data.coverImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cover-image.jpg', { type: blob.type });
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/cover-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('cover-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('cover-photos')
          .getPublicUrl(fileName);

        coverImageUrl = publicUrl;
      }

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
          tagline: data.tagline,
          bio: data.bio,
          experience_years: data.experienceYears,
          intro_categories: data.categories,
          service_regions: data.regions,
          availability: data.availability,
          cover_image_url: coverImageUrl,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          onboarding_phase: 'intro_submitted',
          verification_status: 'pending',
          is_active: false,
          updated_at: new Date().toISOString()
        } as any);

      if (professionalProfileError) throw professionalProfileError;

      toast.success('Thanks! Next: Upload your verification docs', {
        duration: 4000,
      });
      
      navigate('/dashboard/pro');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to submit');
    } finally {
      setIsLoading(false);
    }
  };

  return <ProfessionalOnboardingWizard onSubmit={handleSubmit} isLoading={isLoading} />;
}
