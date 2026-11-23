import type { CurrencyCode, PaginationMeta } from '../contracts/platform.js';

/**
 * Common formatting and calculation helpers enforcing platform conventions.
 */

// ==========================================
// 1. Currency & Decimal-Safe Money
// ==========================================

/**
 * Format a decimal or numeric string into a localized currency string without floating point inaccuracies.
 */
export function formatCurrency(
  amount: number | string,
  currency: CurrencyCode | string = 'USD',
  locale: string = 'en-US'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '$0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Convert monetary decimal string into integer cents (avoids IEEE 754 float rounding issues).
 */
export function decimalToCents(amount: number | string): number {
  const str = typeof amount === 'number' ? amount.toFixed(2) : amount.trim();
  const parts = str.split('.');
  const whole = parseInt(parts[0] || '0', 10);
  const fraction = parts[1] ? parseInt(parts[1].padEnd(2, '0').slice(0, 2), 10) : 0;
  return whole * 100 + (whole < 0 ? -fraction : fraction);
}

/**
 * Convert integer cents into a fixed 2-decimal string.
 */
export function centsToDecimal(cents: number): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const dollars = Math.floor(absCents / 100);
  const remainder = absCents % 100;
  const paddedRemainder = remainder.toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}${dollars}.${paddedRemainder}`;
}

// ==========================================
// 2. Timestamps & Timezones
// ==========================================

/**
 * Format timestamp into relative time string (e.g. "5m ago", "2h ago", "yesterday").
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const timestamp = new Date(isoString).getTime();
  const diffMs = now - timestamp;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Standard date & time formatting.
 */
export function formatDateTime(isoString: string, locale: string = 'en-US'): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(d);
  } catch {
    return isoString;
  }
}

// ==========================================
// 3. Pagination Calculation Helper
// ==========================================

export function calculatePaginationMeta(
  totalItems: number,
  page: number,
  limit: number
): PaginationMeta {
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);
  const totalPages = Math.ceil(totalItems / validLimit);

  return {
    page: validPage,
    limit: validLimit,
    totalItems,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1
  };
}

// ==========================================
// 4. File Size Formatting Helper
// ==========================================

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`;
}
