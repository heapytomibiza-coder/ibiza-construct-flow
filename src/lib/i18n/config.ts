/**
 * i18n Configuration - Re-exports from main config
 * Phase 16: Internationalization & Localization
 * 
 * This file re-exports from the main i18n configuration to avoid duplicate initialization
 */

import i18n from '@/i18n/index';

export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

export const defaultLanguage: SupportedLanguage = 'en';

export default i18n;
