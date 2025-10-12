import { useAuth } from '@/hooks/useAuth';
import { AvailabilityManager } from '@/components/booking/AvailabilityManager';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ProfessionalAvailabilityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: professionalProfile, isLoading } = useQuery({
    queryKey: ['professional-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !professionalProfile) {
      navigate('/');
    }
  }, [isLoading, professionalProfile, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !professionalProfile) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Availability Settings</h1>
        <p className="text-muted-foreground">
          Manage your working hours and booking availability
        </p>
      </div>

      <AvailabilityManager professionalId={user.id} />
    </div>
  );
}
