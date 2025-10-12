/**
 * Locale Formatter Component
 * Phase 16: Internationalization & Localization
 * 
 * Components for locale-aware formatting
 */

import { useLocale } from '@/hooks/i18n';

interface DateFormatterProps {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
}

export function DateFormatter({ date, options }: DateFormatterProps) {
  const { formatDate } = useLocale();
  return <>{formatDate(date, options)}</>;
}

interface NumberFormatterProps {
  value: number;
  options?: Intl.NumberFormatOptions;
}

export function NumberFormatter({ value, options }: NumberFormatterProps) {
  const { formatNumber } = useLocale();
  return <>{formatNumber(value, options)}</>;
}

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
}

export function CurrencyFormatter({ value, currency }: CurrencyFormatterProps) {
  const { formatCurrency } = useLocale();
  return <>{formatCurrency(value, currency)}</>;
}

interface PercentFormatterProps {
  value: number;
  options?: Intl.NumberFormatOptions;
}

export function PercentFormatter({ value, options }: PercentFormatterProps) {
  const { formatPercent } = useLocale();
  return <>{formatPercent(value, options)}</>;
}

interface RelativeTimeFormatterProps {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
}

export function RelativeTimeFormatter({ value, unit }: RelativeTimeFormatterProps) {
  const { formatRelativeTime } = useLocale();
  return <>{formatRelativeTime(value, unit)}</>;
}
