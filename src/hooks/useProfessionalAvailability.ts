import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkingHours {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  status: string;
  custom_message?: string;
  available_until?: string;
  working_hours: WorkingHours;
  buffer_time_minutes: number;
  max_bookings_per_day: number;
  updated_at: string;
}

export interface TimeSlot {
  slot_start: string;
  slot_end: string;
}

export const useProfessionalAvailability = (professionalId?: string) => {
  const [availability, setAvailability] = useState<ProfessionalAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = useCallback(async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setAvailability({
          ...data,
          working_hours: data.working_hours as unknown as WorkingHours
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchAvailability();

    if (!professionalId) return;

    const channel = supabase
      .channel('professional-availability')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_availability',
          filter: `professional_id=eq.${professionalId}`
        },
        () => {
          fetchAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId, fetchAvailability]);

  const updateAvailability = async (updates: Partial<ProfessionalAvailability>) => {
    if (!professionalId) return;

    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .upsert([{
          professional_id: professionalId,
          status: updates.status || 'available',
          custom_message: updates.custom_message,
          available_until: updates.available_until,
          buffer_time_minutes: updates.buffer_time_minutes,
          max_bookings_per_day: updates.max_bookings_per_day,
          working_hours: updates.working_hours as any
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setAvailability({
          ...data,
          working_hours: data.working_hours as unknown as WorkingHours
        });
      }
      
      toast.success('Availability settings updated');
      return data;
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
      throw error;
    }
  };

  const getAvailableSlots = async (date: Date, durationMinutes: number = 60): Promise<TimeSlot[]> => {
    if (!professionalId) return [];

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_professional_id: professionalId,
        p_date: date.toISOString().split('T')[0],
        p_duration_minutes: durationMinutes
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
      return [];
    }
  };

  return {
    availability,
    loading,
    updateAvailability,
    getAvailableSlots,
    refetch: fetchAvailability
  };
};
