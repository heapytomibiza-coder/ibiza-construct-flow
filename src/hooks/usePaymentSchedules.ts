import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePaymentSchedules(userId?: string) {
  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['payment-schedules', userId],
    queryFn: async () => {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from('payment_schedules')
        .select(`
          *,
          job:jobs(*)
        `)
        .or(`payer_id.eq.${uid},payee_id.eq.${uid}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: upcomingPayments, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcoming-payments', userId],
    queryFn: async () => {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id;
      
      // Get schedules for this user
      const { data: userSchedules, error: schedError } = await supabase
        .from('payment_schedules')
        .select('id')
        .or(`payer_id.eq.${uid},payee_id.eq.${uid}`)
        .eq('is_active', true);

      if (schedError) throw schedError;
      if (!userSchedules || userSchedules.length === 0) return [];

      const scheduleIds = userSchedules.map(s => s.id);

      // Get upcoming scheduled payments
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from('scheduled_payments')
        .select(`
          *,
          schedule:payment_schedules(*)
        `)
        .in('schedule_id', scheduleIds)
        .eq('status', 'pending')
        .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('due_date');

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
