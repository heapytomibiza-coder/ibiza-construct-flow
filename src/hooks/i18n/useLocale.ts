/**
 * Locale Formatting Hook
 * Phase 16: Internationalization & Localization
 * 
 * Provides locale-aware formatting for dates, numbers, and currency
 */

import { useMemo } from 'react';
import { useTranslation } from './useTranslation';

export function useLocale() {
  const { currentLanguage } = useTranslation();

  const formatters = useMemo(() => {
    const locale = currentLanguage;

    return {
      // Date formatting
      formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, options).format(dateObj);
      },

      // Number formatting
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(locale, options).format(value);
      },

      // Currency formatting
      formatCurrency: (value: number, currency = 'USD') => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(value);
      },

      // Percentage formatting
      formatPercent: (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          ...options,
        }).format(value);
      },

      // Relative time formatting
      formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
      },
    };
  }, [currentLanguage]);

  return {
    locale: currentLanguage,
    ...formatters,
  };
}
