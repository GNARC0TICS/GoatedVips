
/**
 * Domain utilities for client-side routing
 */

/**
 * Check if the current domain is the admin domain (goombas.net)
 */
export const isAdminDomain = (): boolean => {
  return window.location.hostname === 'goombas.net' || 
         window.location.hostname.includes('goombas.net');
};

/**
 * Get the base API URL based on current domain
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
