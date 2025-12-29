// Force rebuild - cache invalidation v3 - Constructive Solutions Ibiza
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations directly (bundled for reliability) - EN and ES only
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

const resources = {
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
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    ns: ['common', 'navigation', 'services', 'auth', 'dashboard', 'hero', 'components', 'howItWorks', 'footer', 'pages', 'wizard', 'admin', 'questions', 'discovery', 'home'],
    defaultNS: 'common',
    interpolation: { 
      escapeValue: false 
    },
    returnNull: false,
    returnEmptyString: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: { 
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
  });

// Update document lang when language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  document.documentElement.lang = lng;
});

export default i18n;
