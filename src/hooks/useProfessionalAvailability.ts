import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline';

export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  status: string;
  custom_message: string | null;
  available_until: string | null;
  updated_at: string;
  created_at: string;
}

export const useProfessionalAvailability = (professionalId?: string) => {
  const [availability, setAvailability] = useState<ProfessionalAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (!error && data) {
        setAvailability(data);
      } else if (error?.code === 'PGRST116') {
        // No availability record exists yet
        setAvailability(null);
      }
      setLoading(false);
    };

    fetchAvailability();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`availability:${professionalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_availability',
          filter: `professional_id=eq.${professionalId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setAvailability(null);
          } else {
            setAvailability(payload.new as ProfessionalAvailability);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId]);

  const updateAvailability = useCallback(async (
    status: AvailabilityStatus,
    customMessage?: string,
    availableUntil?: Date
  ) => {
    if (!professionalId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== professionalId) {
      throw new Error('Unauthorized');
    }

    const updates = {
      professional_id: professionalId,
      status,
      custom_message: customMessage || null,
      available_until: availableUntil?.toISOString() || null
    };

    const { error } = await supabase
      .from('professional_availability')
      .upsert(updates, { onConflict: 'professional_id' });

    if (error) throw error;
  }, [professionalId]);

  return {
    availability,
    loading,
    updateAvailability
  };
};
