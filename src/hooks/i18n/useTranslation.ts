/**
 * Enhanced Translation Hook
 * Phase 16: Internationalization & Localization
 * 
 * Type-safe wrapper around react-i18next with additional utilities
 */

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { SupportedLanguage } from '@/lib/i18n/config';

export function useTranslation() {
  const { t, i18n } = useI18nextTranslation();

  const changeLanguage = async (language: SupportedLanguage) => {
    await i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language as SupportedLanguage;

  return {
    t,
    currentLanguage,
    changeLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
}
