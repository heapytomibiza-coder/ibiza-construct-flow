import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeSlot {
  slot_start: string;
  slot_end: string;
}

export function useBookingSlots(professionalId: string, date: Date, durationMinutes: number = 60) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!professionalId || !date) return;

    setLoading(true);
    const client: any = supabase;
    
    const dateString = date.toISOString().split('T')[0];
    
    const { data, error } = await client
      .rpc('get_available_slots', {
        p_professional_id: professionalId,
        p_date: dateString,
        p_duration_minutes: durationMinutes
      });

    if (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available time slots');
      setSlots([]);
    } else {
      setSlots(data || []);
    }
    setLoading(false);
  }, [professionalId, date, durationMinutes]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const bookSlot = useCallback(async (slot: TimeSlot, eventDetails: {
    title: string;
    description?: string;
    location?: any;
  }) => {
    const client: any = supabase;
    const { data: { user } } = await client.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to book a slot');
      return null;
    }

    const { data, error } = await client
      .from('calendar_events')
      .insert({
        user_id: professionalId,
        title: eventDetails.title,
        description: eventDetails.description,
        start_time: slot.slot_start,
        end_time: slot.slot_end,
        event_type: 'booking',
        status: 'scheduled',
        location: eventDetails.location,
        attendees: [user.id, professionalId]
      })
      .select()
      .single();

    if (error) {
      console.error('Error booking slot:', error);
      toast.error('Failed to book time slot');
      return null;
    }

    toast.success('Booking confirmed!');
    setSelectedSlot(null);
    fetchSlots(); // Refresh slots
    return data;
  }, [professionalId, fetchSlots]);

  return {
    slots,
    loading,
    selectedSlot,
    setSelectedSlot,
    bookSlot,
    refreshSlots: fetchSlots
  };
}
