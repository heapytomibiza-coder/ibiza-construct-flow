import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update document language attribute for SEO
    document.documentElement.lang = i18n.language;
    
    // Update document title direction for RTL languages if needed
    document.documentElement.dir = 'ltr'; // Both EN and ES are LTR
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isSpanish: i18n.language.startsWith('es'),
    isEnglish: i18n.language.startsWith('en'),
  };
};