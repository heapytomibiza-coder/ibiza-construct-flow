/**
 * i18n Configuration Constants
 * Phase 16: Internationalization
 */

export const supportedLanguages = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;
