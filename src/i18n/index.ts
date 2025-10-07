import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { supabase } from '@/integrations/supabase/client';

// Custom language detector that prioritizes Ibiza location
const IbizaLanguageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    // Check localStorage first
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang) {
      callback(storedLang);
      return;
    }

    // Try to detect Ibiza location through various means
    try {
      // Check timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone === 'Europe/Madrid' || timezone === 'Atlantic/Canary') {
        callback('es');
        return;
      }

      // Check geolocation if available (with permission)
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Ibiza coordinates: ~38.9°N, 1.4°E
            // Check if within Balearic Islands region
            if (latitude > 38.5 && latitude < 40 && longitude > 1 && longitude < 4) {
              callback('es');
              localStorage.setItem('i18nextLng', 'es');
            } else {
              callback('en');
            }
          },
          () => {
            // Geolocation failed, fallback to browser language
            const browserLang = navigator.language.split('-')[0];
            callback(browserLang === 'es' ? 'es' : 'en');
          },
          { timeout: 5000 }
        );
        return;
      }
    } catch (error) {
      console.log('Location detection failed, using default');
    }

    // Fallback to browser language
    const browserLang = navigator.language.split('-')[0];
    callback(browserLang === 'es' ? 'es' : 'en');
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('i18nextLng', lng);
    // Save to user profile if authenticated
    saveLanguageToProfile(lng);
  },
};

// Save language preference to user profile
const saveLanguageToProfile = async (language: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get current preferences first
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();
      
      const currentPreferences = (profile?.preferences as Record<string, any>) || {};
      
      await supabase
        .from('profiles')
        .update({ 
          preferences: { ...currentPreferences, language }
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.log('Failed to save language preference:', error);
  }
};

i18n
  .use(Backend)
  .use(IbizaLanguageDetector as any)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    ns: ['common', 'navigation', 'services', 'auth', 'dashboard', 'hero', 'components', 'howItWorks', 'footer', 'pages', 'wizard', 'admin'],
    defaultNS: 'common',
    interpolation: { 
      escapeValue: false 
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
    },
    react: { 
      useSuspense: false 
    },
  });

// Load user's language preference from profile on app start
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // Defer profile fetch to prevent blocking critical auth flow
    setTimeout(async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', session.user.id)
          .single();
        
        const preferences = profile?.preferences as Record<string, any> | null;
        if (preferences && typeof preferences === 'object' && 'language' in preferences) {
          i18n.changeLanguage(preferences.language as string);
        }
      } catch (error) {
        console.log('Failed to load language preference:', error);
      }
    }, 0);
  }
});

export default i18n;