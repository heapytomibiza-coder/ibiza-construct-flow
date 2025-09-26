import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    ns: ['common', 'navigation', 'services', 'auth', 'dashboard', 'hero', 'components', 'howItWorks', 'footer', 'pages', 'wizard'],
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

export default i18n;