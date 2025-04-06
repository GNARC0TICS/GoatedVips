/**
 * Utility functions for formatting data in consistent ways across the application
 */

/**
 * Format a number as currency (USD by default)
 * @param value The value to format
 * @param locale The locale to use for formatting
 * @param currency The currency code to use
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale = 'en-US',
  currency = 'USD'
): string {
  if (!value && value !== 0) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number with thousands separators
 * @param value The value to format
 * @param locale The locale to use for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale = 'en-US'
): string {
  if (!value && value !== 0) return '0';
  
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value The value to format (0-1)
 * @param locale The locale to use for formatting
 * @param digits Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  locale = 'en-US',
  digits = 1
): string {
  if (!value && value !== 0) return '0%';
  
  // Convert decimal (0-1) to percentage (0-100)
  const percentage = value <= 1 ? value * 100 : value;
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(percentage / 100);
}

/**
 * Format a number as a compact representation (e.g., 1.2K, 5.3M)
 * @param value The value to format
 * @param locale The locale to use for formatting
 * @returns Formatted compact string
 */
export function formatCompact(
  value: number,
  locale = 'en-US'
): string {
  if (!value && value !== 0) return '0';
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value);
}

/**
 * Format a date to a readable string
 * @param date The date to format (Date object or ISO string)
 * @param locale The locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  locale = 'en-US'
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * Format a date to include time
 * @param date The date to format (Date object or ISO string)
 * @param locale The locale to use for formatting
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string,
  locale = 'en-US'
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format a duration in milliseconds to a readable string
 * @param milliseconds Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(milliseconds: number): string {
  if (!milliseconds) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format a number as a file size (e.g., 1.5 KB, 3.2 MB)
 * @param bytes The file size in bytes
 * @param locale The locale to use for formatting
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, locale = 'en-US'): string {
  if (!bytes && bytes !== 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1
  }).format(value)} ${units[unitIndex]}`;
}