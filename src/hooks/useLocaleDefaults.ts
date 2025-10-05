import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IBIZA_DEFAULTS, detectIbizaUser } from '@/lib/ibiza-defaults';
import { supabase } from '@/integrations/supabase/client';

interface LocaleDefaults {
  locale: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  defaultLocation: typeof IBIZA_DEFAULTS.defaultLocation;
  phonePrefix: string;
}

export function useLocaleDefaults() {
  const { i18n } = useTranslation();
  const [defaults, setDefaults] = useState<LocaleDefaults>(IBIZA_DEFAULTS);
  const [isIbizaUser, setIsIbizaUser] = useState(false);

  useEffect(() => {
    const initializeDefaults = async () => {
      // Check if user is likely from Ibiza
      const ibizaDetected = detectIbizaUser();
      setIsIbizaUser(ibizaDetected);

      if (ibizaDetected) {
        // Set Spanish as default
        if (i18n.language !== 'es') {
          await i18n.changeLanguage('es');
        }

        // Save preference to profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({
              preferences: {
                locale: 'es',
                currency: 'EUR',
                timezone: 'Europe/Madrid',
              }
            })
            .eq('id', user.id);
        }
      }

      // Try to get location from browser
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Check if coordinates are near Ibiza (38.9067°N, 1.4206°E)
            const distanceToIbiza = Math.sqrt(
              Math.pow(latitude - 38.9067, 2) + Math.pow(longitude - 1.4206, 2)
            );
            if (distanceToIbiza < 0.5) {
              // Within ~50km of Ibiza
              setDefaults(IBIZA_DEFAULTS);
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
          }
        );
      }
    };

    initializeDefaults();
  }, [i18n]);

  const getLastUsedLocation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: lastJob } = await supabase
        .from('jobs')
        .select('location')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return lastJob?.location;
    } catch (error) {
      console.error('Error fetching last location:', error);
      return null;
    }
  };

  return {
    defaults,
    isIbizaUser,
    getLastUsedLocation,
  };
}
