import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';

export function initRealtime(queryClient: QueryClient) {
  const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
      console.log('[Realtime] Jobs table changed, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
      console.log('[Realtime] Offers table changed, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
      console.log('[Realtime] Booking requests changed, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
      console.log('[Realtime] Contracts changed, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    })
    .subscribe((status) => {
      console.log('[Realtime] Subscription status:', status);
    });

  return () => {
    console.log('[Realtime] Unsubscribing from realtime updates');
    supabase.removeChannel(channel);
  };
}
