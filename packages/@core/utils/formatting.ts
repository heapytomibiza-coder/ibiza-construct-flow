/**
 * Formatting Utilities
 * @core - Pure formatting functions
 */

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'en-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-ES'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffDay > 0) return rtf.format(-diffDay, 'day');
  if (diffHour > 0) return rtf.format(-diffHour, 'hour');
  if (diffMin > 0) return rtf.format(-diffMin, 'minute');
  return rtf.format(-diffSec, 'second');
}

/**
 * Format file size in human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(
  value: number,
  locale: string = 'en-ES'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  locale: string = 'en-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
