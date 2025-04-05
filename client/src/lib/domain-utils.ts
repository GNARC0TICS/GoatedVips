/**
 * API URL utilities for the unified application interface
 * Updated to work with the new structure that doesn't rely on separate domains
 */

// Constants
const APP_URL = import.meta.env.VITE_APP_URL || '';
const ADMIN_PREFIX = '/admin';

/**
 * Checks if the current path is in the admin section
 * This replaces the old domain-based check with a path-based check
 */
export const isAdminPath = (): boolean => {
  const pathname = window.location.pathname;
  return pathname.startsWith(ADMIN_PREFIX);
};

/**
 * Returns the appropriate API base URL
 * This is now solely based on the path, not the domain
 */
export const getApiBaseUrl = (): string => {
  if (isAdminPath()) {
    return '/api/admin';
  }
  return '/api';
};

/**
 * Format API endpoint for the unified interface
 */
export const formatApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Legacy function to maintain compatibility
 * Now just returns a boolean based on the URL path, not the domain
 */
export const isAdminDomain = (): boolean => {
  return isAdminPath();
};

/**
 * No longer needs to redirect between domains
 * Now simply navigates to the appropriate path within the same app
 * @param requireAdmin Whether the current page requires admin access
 */
export const enforceCorrectDomain = (requireAdmin: boolean): void => {
  const currentIsAdmin = isAdminPath();

  // If we need admin but not on admin path, redirect to admin section
  if (requireAdmin && !currentIsAdmin) {
    window.location.pathname = `${ADMIN_PREFIX}${window.location.pathname}`;
  }

  // If we're on admin path but don't need admin, redirect to public section
  if (!requireAdmin && currentIsAdmin) {
    const publicPath = window.location.pathname.replace(ADMIN_PREFIX, '');
    window.location.pathname = publicPath || '/';
  }
};