import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch count of pending professional profile verifications
 * Used in admin sidebar to show badge count
 */
export function usePendingVerifications() {
  return useQuery({
    queryKey: ['admin', 'pending-verifications'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('professional_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
