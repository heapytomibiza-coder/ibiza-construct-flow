import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple hook to check if a single feature flag is enabled for the current user
 * Uses server-side RPC to evaluate audience rules and overrides
 */
export function useFeatureFlag(key: string) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkFlag() {
      try {
        const { data, error } = await supabase.rpc('is_feature_on' as any, { 
          p_key: key 
        });
        
        if (!mounted) return;
        
        if (error) {
          console.error('Feature flag check failed:', error);
          setEnabled(false);
        } else {
          setEnabled(Boolean(data));
        }
      } catch (error) {
        console.error('Feature flag error:', error);
        setEnabled(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkFlag();

    return () => {
      mounted = false;
    };
  }, [key]);

  return { enabled, loading };
}
