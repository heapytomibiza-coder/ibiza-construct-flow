import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type BookingTimeSlot = Database['public']['Tables']['booking_time_slots']['Row'];
type BookingTimeSlotInsert = Database['public']['Tables']['booking_time_slots']['Insert'];

export const useBookingTimeSlots = (professionalId?: string, date?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ['booking-time-slots', professionalId, date],
    queryFn: async () => {
      let query = supabase
        .from('booking_time_slots')
        .select('*, services(*)')
        .eq('professional_id', professionalId!);

      if (date) {
        query = query.eq('slot_date', date);
      }

      const { data, error } = await query
        .eq('is_available', true)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!professionalId,
  });

  const createTimeSlot = useMutation({
    mutationFn: async (slot: BookingTimeSlotInsert) => {
      const { data, error } = await supabase
        .from('booking_time_slots')
        .insert(slot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-time-slots'] });
      toast({
        title: 'Time slot created',
        description: 'New time slot added successfully',
      });
    },
  });

  const bookTimeSlot = useMutation({
    mutationFn: async ({ slotId, bookingId }: { slotId: string; bookingId: string }) => {
      // First get current slot data
      const { data: slot } = await supabase
        .from('booking_time_slots')
        .select('booked_count, capacity')
        .eq('id', slotId)
        .single();

      if (!slot) throw new Error('Slot not found');

      const newBookedCount = slot.booked_count + 1;
      const isStillAvailable = newBookedCount < slot.capacity;

      const { data, error } = await supabase
        .from('booking_time_slots')
        .update({
          booking_id: bookingId,
          booked_count: newBookedCount,
          is_available: isStillAvailable,
        })
        .eq('id', slotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-time-slots'] });
      toast({
        title: 'Slot booked',
        description: 'Time slot has been booked',
      });
    },
  });

  const releaseTimeSlot = useMutation({
    mutationFn: async (slotId: string) => {
      // First get current slot data
      const { data: slot } = await supabase
        .from('booking_time_slots')
        .select('booked_count')
        .eq('id', slotId)
        .single();

      if (!slot) throw new Error('Slot not found');

      const newBookedCount = Math.max(slot.booked_count - 1, 0);

      const { data, error } = await supabase
        .from('booking_time_slots')
        .update({
          booking_id: null,
          booked_count: newBookedCount,
          is_available: true,
        })
        .eq('id', slotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-time-slots'] });
      toast({
        title: 'Slot released',
        description: 'Time slot is now available',
      });
    },
  });

  return {
    timeSlots,
    isLoading,
    createTimeSlot: createTimeSlot.mutate,
    bookTimeSlot: bookTimeSlot.mutate,
    releaseTimeSlot: releaseTimeSlot.mutate,
  };
};
