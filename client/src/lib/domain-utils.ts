/**
 * Domain utility functions
 * Modified to work with a single-domain approach
 */

/**
 * Always returns true since all features are now available on a single domain
 */
export const isAdminDomain = (): boolean => {
  return true;
};

/**
 * Always returns true since all features are now available on a single domain
 */
export const isPublicDomain = (): boolean => {
  return true;
};

/**
 * Returns the base API URL for the application
 */
export const getApiBaseUrl = (): string => {
  // Use relative URL to ensure requests go to the same domain
  return '/api';
};

/**
 * Returns the base WebSocket URL for the application
 */
export const getWebSocketUrl = (): string => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};