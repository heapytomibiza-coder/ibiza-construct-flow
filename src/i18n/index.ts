import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase } from '@/integrations/supabase/client';

// Import all translations directly (bundled for reliability)
import enCommon from '../../public/locales/en/common.json';
import enPages from '../../public/locales/en/pages.json';
import enNavigation from '../../public/locales/en/navigation.json';
import enServices from '../../public/locales/en/services.json';
import enAuth from '../../public/locales/en/auth.json';
import enDashboard from '../../public/locales/en/dashboard.json';
import enHero from '../../public/locales/en/hero.json';
import enComponents from '../../public/locales/en/components.json';
import enHowItWorks from '../../public/locales/en/howItWorks.json';
import enFooter from '../../public/locales/en/footer.json';
import enWizard from '../../public/locales/en/wizard.json';
import enAdmin from '../../public/locales/en/admin.json';
import enQuestions from '../../public/locales/en/questions.json';
import enDiscovery from '../../public/locales/en/discovery.json';
import enHome from '../../public/locales/en/home.json';

import esCommon from '../../public/locales/es/common.json';
import esPages from '../../public/locales/es/pages.json';
import esNavigation from '../../public/locales/es/navigation.json';
import esServices from '../../public/locales/es/services.json';
import esAuth from '../../public/locales/es/auth.json';
import esDashboard from '../../public/locales/es/dashboard.json';
import esHero from '../../public/locales/es/hero.json';
import esComponents from '../../public/locales/es/components.json';
import esHowItWorks from '../../public/locales/es/howItWorks.json';
import esFooter from '../../public/locales/es/footer.json';
import esWizard from '../../public/locales/es/wizard.json';
import esAdmin from '../../public/locales/es/admin.json';
import esQuestions from '../../public/locales/es/questions.json';
import esDiscovery from '../../public/locales/es/discovery.json';
import esHome from '../../public/locales/es/home.json';

import deCommon from '../../public/locales/de/common.json';
import dePages from '../../public/locales/de/pages.json';
import deNavigation from '../../public/locales/de/navigation.json';
import deServices from '../../public/locales/de/services.json';
import deAuth from '../../public/locales/de/auth.json';
import deDashboard from '../../public/locales/de/dashboard.json';
import deHero from '../../public/locales/de/hero.json';
import deComponents from '../../public/locales/de/components.json';
import deHowItWorks from '../../public/locales/de/howItWorks.json';
import deFooter from '../../public/locales/de/footer.json';
import deWizard from '../../public/locales/de/wizard.json';
import deAdmin from '../../public/locales/de/admin.json';
import deQuestions from '../../public/locales/de/questions.json';
import deDiscovery from '../../public/locales/de/discovery.json';
import deHome from '../../public/locales/de/home.json';

import frCommon from '../../public/locales/fr/common.json';
import frPages from '../../public/locales/fr/pages.json';
import frNavigation from '../../public/locales/fr/navigation.json';
import frServices from '../../public/locales/fr/services.json';
import frAuth from '../../public/locales/fr/auth.json';
import frDashboard from '../../public/locales/fr/dashboard.json';
import frHero from '../../public/locales/fr/hero.json';
import frComponents from '../../public/locales/fr/components.json';
import frHowItWorks from '../../public/locales/fr/howItWorks.json';
import frFooter from '../../public/locales/fr/footer.json';
import frWizard from '../../public/locales/fr/wizard.json';
import frAdmin from '../../public/locales/fr/admin.json';
import frQuestions from '../../public/locales/fr/questions.json';
import frDiscovery from '../../public/locales/fr/discovery.json';
import frHome from '../../public/locales/fr/home.json';

// Save language preference to user profile
const saveLanguageToProfile = async (language: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        pages: enPages,
        navigation: enNavigation,
        services: enServices,
        auth: enAuth,
        dashboard: enDashboard,
        hero: enHero,
        components: enComponents,
        howItWorks: enHowItWorks,
        footer: enFooter,
        wizard: enWizard,
        admin: enAdmin,
        questions: enQuestions,
        discovery: enDiscovery,
        home: enHome,
      },
      es: {
        common: esCommon,
        pages: esPages,
        navigation: esNavigation,
        services: esServices,
        auth: esAuth,
        dashboard: esDashboard,
        hero: esHero,
        components: esComponents,
        howItWorks: esHowItWorks,
        footer: esFooter,
        wizard: esWizard,
        admin: esAdmin,
        questions: esQuestions,
        discovery: esDiscovery,
        home: esHome,
      },
      de: {
        common: deCommon,
        pages: dePages,
        navigation: deNavigation,
        services: deServices,
        auth: deAuth,
        dashboard: deDashboard,
        hero: deHero,
        components: deComponents,
        howItWorks: deHowItWorks,
        footer: deFooter,
        wizard: deWizard,
        admin: deAdmin,
        questions: deQuestions,
        discovery: deDiscovery,
        home: deHome,
      },
      fr: {
        common: frCommon,
        pages: frPages,
        navigation: frNavigation,
        services: frServices,
        auth: frAuth,
        dashboard: frDashboard,
        hero: frHero,
        components: frComponents,
        howItWorks: frHowItWorks,
        footer: frFooter,
        wizard: frWizard,
        admin: frAdmin,
        questions: frQuestions,
        discovery: frDiscovery,
        home: frHome,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'de', 'fr'],
    ns: ['common', 'navigation', 'services', 'auth', 'dashboard', 'hero', 'components', 'howItWorks', 'footer', 'pages', 'wizard', 'admin', 'questions', 'discovery', 'home'],
    defaultNS: 'common',
    interpolation: { 
      escapeValue: false 
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: { 
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: 'added removed',
    },
  });

// Update cache and document when language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  document.documentElement.lang = lng;
  saveLanguageToProfile(lng);
});

// Load user's language preference from profile on app start
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
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
