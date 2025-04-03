/**
 * Utility functions for formatting values in the UI
 */

/**
 * Format a number as currency (USD)
 * 
 * @param value - The numeric value to format (can be number or string)
 * @param minimumFractionDigits - Minimum number of decimal places (default: 2)
 * @param maximumFractionDigits - Maximum number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string, 
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  
  // Handle string values with proper error checking
  let numericValue: number;
  try {
    numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Handle NaN values gracefully
    if (isNaN(numericValue)) {
      return '$0.00';
    }
  } catch (error) {
    console.error("Error converting value to number:", error);
    return '$0.00';
  }
  
  try {
    // For very large numbers, limit decimals further
    const adjustedMaxFractionDigits = (() => {
      if (numericValue >= 10000) return 0;
      if (numericValue >= 1000) return 1;
      return maximumFractionDigits;
    })();
    
    // Clamp to safe values for Intl.NumberFormat (0-20)
    const safeMinFractionDigits = Math.min(Math.max(0, minimumFractionDigits), 20);
    const safeMaxFractionDigits = Math.min(Math.max(0, adjustedMaxFractionDigits), 20);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: safeMinFractionDigits,
      maximumFractionDigits: safeMaxFractionDigits
    }).format(numericValue);
  } catch (error) {
    console.error("Error formatting currency:", error, "Value:", value);
    return '$' + numericValue.toFixed(2);
  }
}

/**
 * Format a large number with abbreviations (K, M, B)
 * 
 * @param value - The numeric value to format
 * @returns Abbreviated number string
 */
export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1  // This is already within valid range (0-20)
  }).format(value);
}

/**
 * Format a date as a relative time string (e.g., "5 minutes ago")
 * 
 * @param dateString - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) {
    return 'Unknown';
  }
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (secondsAgo < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Default to formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a percentage value
 * 
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (value === null || value === undefined) {
    return '0%';
  }
  
  // Ensure decimals is within valid range (0-20)
  decimals = Math.min(Math.max(0, decimals), 20);
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}