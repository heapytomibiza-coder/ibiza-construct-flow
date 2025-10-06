import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeeklySchedule {
  [day: number]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export function useAvailability(professionalId?: string) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const { toast } = useToast();

  useEffect(() => {
    if (professionalId) {
      fetchAvailability();
    }
  }, [professionalId]);

  const fetchAvailability = async () => {
    if (!professionalId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .select('working_hours, buffer_time_minutes')
        .eq('professional_id', professionalId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const hours = data.working_hours;
        if (hours && typeof hours === 'object') {
          setSchedule(hours as unknown as WeeklySchedule);
        } else {
          setSchedule(getDefaultSchedule());
        }
        setBufferMinutes(data.buffer_time_minutes || 15);
      } else {
        setSchedule(getDefaultSchedule());
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSchedule = (): WeeklySchedule => {
    const schedule: WeeklySchedule = {};
    for (let i = 0; i < 7; i++) {
      // Default: Monday-Friday 9-5, weekends disabled
      schedule[i] = {
        enabled: i >= 1 && i <= 5,
        start: '09:00',
        end: '17:00',
      };
    }
    return schedule;
  };

  const updateAvailability = async (newSchedule: WeeklySchedule, newBuffer: number) => {
    if (!professionalId) {
      toast({
        title: "Error",
        description: "Professional ID is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('professional_availability')
        .select('id')
        .eq('professional_id', professionalId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('professional_availability')
          .update({
            working_hours: newSchedule as any,
            buffer_time_minutes: newBuffer,
            updated_at: new Date().toISOString(),
          })
          .eq('professional_id', professionalId);
        
        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('professional_availability')
          .insert([{
            professional_id: professionalId,
            status: 'available',
            working_hours: newSchedule as any,
            buffer_time_minutes: newBuffer,
          }]);
        
        if (insertError) throw insertError;
      }

      setSchedule(newSchedule);
      setBufferMinutes(newBuffer);

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getAvailableSlots = async (date: Date, durationMinutes: number = 60) => {
    if (!professionalId) return [];

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_professional_id: professionalId,
        p_date: date.toISOString().split('T')[0],
        p_duration_minutes: durationMinutes
      });

      if (error) throw error;

      return (data || []).map((slot: any) => ({
        iso: slot.slot_start,
        label: new Date(slot.slot_start).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        available: true,
      }));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  };

  return {
    loading,
    saving,
    schedule,
    bufferMinutes,
    updateAvailability,
    getAvailableSlots,
    refetch: fetchAvailability,
  };
}
