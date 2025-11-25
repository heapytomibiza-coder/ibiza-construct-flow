/**
 * Weekly Digest Hook
 * Phase 6: Weekly Review Digest System
 * 
 * Hook for managing weekly review digest functionality
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useWeeklyDigest() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const triggerDigest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-review-digest');

      if (error) throw error;

      toast({
        title: 'Digest Sent',
        description: `Successfully sent ${data.digestsSent} weekly digest emails.`,
      });

      return data;
    } catch (error) {
      console.error('Error triggering digest:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send digest',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    triggerDigest,
    loading,
  };
}
