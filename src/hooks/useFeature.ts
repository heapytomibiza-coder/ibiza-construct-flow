import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useFeature(key: string, defaultValue = false) {
  const [enabled, setEnabled] = useState(defaultValue);

  useEffect(() => {
    const channel = supabase.channel(`ff:${key}`);
    
    (async () => {
      try {
        const { data } = await supabase
          .from('feature_flags')
          .select('enabled')
          .eq('key', key)
          .single();
        
        if (data) setEnabled(!!data.enabled);
      } catch (error) {
        console.warn(`Feature flag ${key} not found, using default:`, defaultValue);
        setEnabled(defaultValue);
      }
    })();

    channel.on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'feature_flags', filter: `key=eq.${key}` },
      (payload) => setEnabled((payload.new as any).enabled)
    ).subscribe();

    return () => { 
      channel.unsubscribe(); 
    };
  }, [key, defaultValue]);

  return enabled;
}