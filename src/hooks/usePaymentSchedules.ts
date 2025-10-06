import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePaymentSchedules(userId?: string) {
  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['payment-schedules', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*, jobs(*)')
        .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: upcomingPayments, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcoming-payments', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_upcoming_payments', {
        p_user_id: userId || (await supabase.auth.getUser()).data.user?.id,
        p_days_ahead: 30,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    schedules,
    loadingSchedules,
    upcomingPayments,
    loadingUpcoming,
  };
}
