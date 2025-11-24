import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/i18n/config';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // Update document language attribute for SEO
    document.documentElement.lang = i18n.language;
    
    // Update document title direction for RTL languages if needed
    document.documentElement.dir = 'ltr'; // EN, ES, DE, FR are all LTR
  }, [i18n.language]);

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = (i18n.language.split('-')[0] as SupportedLanguage) || 'en';

  return {
    currentLanguage,
    changeLanguage,
    t,
    i18n,
    isSpanish: i18n.language.startsWith('es'),
    isEnglish: i18n.language.startsWith('en'),
    isGerman: i18n.language.startsWith('de'),
    isFrench: i18n.language.startsWith('fr'),
  };
};