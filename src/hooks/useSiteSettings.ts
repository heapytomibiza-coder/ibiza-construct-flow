import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettingValue {
  [key: string]: any;
}

export function useSiteSettings(section: string, key: string) {
  const [value, setValue] = useState<SiteSettingValue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial value
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('section', section)
          .eq('key', key)
          .maybeSingle(); // Use maybeSingle to avoid PGRST116 errors when no row exists

        // Only throw on real errors, not "no rows" (which is null with maybeSingle)
        if (error) {
          console.error('Error fetching site settings:', error);
        }
        setValue(data?.value as SiteSettingValue || null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`site_settings:${section}:${key}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: `section=eq.${section},key=eq.${key}`,
        },
        (payload) => {
          setValue(payload.new.value as SiteSettingValue);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [section, key]);

  return { value, loading };
}
