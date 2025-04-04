/**
 * Domain utility functions for determining the current domain type
 * and constructing appropriate API URLs
 */

/**
 * Checks if the current domain is the admin domain (goombas.net)
 */
export const isAdminDomain = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'goombas.net' || 
         hostname.includes('goombas.net') || 
         hostname.includes('goombas.');
};

/**
 * Returns the appropriate API base URL based on the current domain
 */
export const getApiBaseUrl = (): string => {
  if (isAdminDomain()) {
    return '/api/admin';
  }
  return '/api';
};

/**
 * Format API endpoint based on current domain
 */
export const formatApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Redirects to the appropriate domain if needed
 * @param requireAdmin Whether the current page requires admin access
 */
export const enforceCorrectDomain = (requireAdmin: boolean): void => {
  const currentIsAdmin = isAdminDomain();

  // If we're on admin page but not admin domain, redirect
  if (requireAdmin && !currentIsAdmin) {
    const adminUrl = `https://goombas.net${window.location.pathname}`;
    window.location.href = adminUrl;
  }

  // If we're on public page but using admin domain, redirect
  if (!requireAdmin && currentIsAdmin) {
    const publicUrl = `https://goatedvips.gg${window.location.pathname}`;
    window.location.href = publicUrl;
  }
};