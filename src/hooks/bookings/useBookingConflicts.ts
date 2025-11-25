import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type BookingConflict = Database['public']['Tables']['booking_conflicts']['Row'];

export const useBookingConflicts = (bookingId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['booking-conflicts', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_conflicts')
        .select('*, bookings!booking_conflicts_conflicting_booking_id_fkey(*)')
        .eq('booking_id', bookingId!)
        .is('resolved_at', null)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  const detectConflicts = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase.rpc('detect_booking_conflicts', {
        p_booking_id: bookingId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        toast({
          title: 'Conflicts detected',
          description: `Found ${data.length} booking conflict(s)`,
          variant: 'destructive',
        });
      }
    },
  });

  const resolveConflict = useMutation({
    mutationFn: async ({
      conflictId,
      resolutionNotes,
    }: {
      conflictId: string;
      resolutionNotes?: string;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('booking_conflicts')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: session?.session?.user?.id,
          resolution_notes: resolutionNotes,
        })
        .eq('id', conflictId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-conflicts'] });
      toast({
        title: 'Conflict resolved',
        description: 'The booking conflict has been resolved',
      });
    },
  });

  return {
    conflicts,
    isLoading,
    detectConflicts: detectConflicts.mutate,
    resolveConflict: resolveConflict.mutate,
  };
};
