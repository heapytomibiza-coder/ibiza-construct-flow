import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePendingVerifications() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingCount();

    // Real-time subscription for verification changes
    const channel = supabase
      .channel('pending-verifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_verifications'
        },
        () => {
          loadPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('professional_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Error loading pending verifications count:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { pendingCount, loading };
}
