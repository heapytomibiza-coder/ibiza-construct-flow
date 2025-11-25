import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type RecurringBooking = Database['public']['Tables']['recurring_bookings']['Row'];
type RecurringBookingInsert = Database['public']['Tables']['recurring_bookings']['Insert'];

export const useRecurringBookings = (bookingId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recurringBooking, isLoading } = useQuery({
    queryKey: ['recurring-booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_bookings')
        .select('*')
        .eq('booking_id', bookingId!)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  const createRecurring = useMutation({
    mutationFn: async (recurring: RecurringBookingInsert) => {
      const { data, error } = await supabase
        .from('recurring_bookings')
        .insert(recurring)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-booking'] });
      toast({
        title: 'Recurring booking created',
        description: 'Your recurring booking has been set up',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create recurring booking',
        variant: 'destructive',
      });
    },
  });

  const updateRecurring = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RecurringBooking> }) => {
      const { data, error } = await supabase
        .from('recurring_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-booking'] });
      toast({
        title: 'Updated',
        description: 'Recurring booking updated successfully',
      });
    },
  });

  const cancelRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_bookings')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-booking'] });
      toast({
        title: 'Cancelled',
        description: 'Recurring booking has been cancelled',
      });
    },
  });

  return {
    recurringBooking,
    isLoading,
    createRecurring: createRecurring.mutate,
    updateRecurring: updateRecurring.mutate,
    cancelRecurring: cancelRecurring.mutate,
  };
};
