import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useFeature(key: string, defaultValue = false) {
  const [enabled, setEnabled] = useState(defaultValue);

  useEffect(() => {
    // Simple feature flag fetch without realtime subscription
    const fetchFeatureFlag = async () => {
      try {
        const { data } = await supabase
          .from('feature_flags')
          .select('enabled')
          .eq('key', key)
          .single();
        
        if (data) {
          setEnabled(!!data.enabled);
        }
      } catch (error) {
        console.warn(`Feature flag ${key} not found, using default:`, defaultValue);
        setEnabled(defaultValue);
      }
    };

    fetchFeatureFlag();
  }, [key, defaultValue]);

  return enabled;
}