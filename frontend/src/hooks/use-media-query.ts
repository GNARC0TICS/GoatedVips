import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * 
 * This hook allows components to respond to media query changes,
 * such as screen size breakpoints.
 * 
 * @param query The media query to match against
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state
  const getMatches = (query: string): boolean => {
    // For SSR, return false initially
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  // Add event listener for window resize
  useEffect(() => {
    // Early return if window is not defined (SSR)
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add the listener to the media query
    if (mediaQuery.addEventListener) {
      // Modern browsers
      mediaQuery.addEventListener('change', handler);
    } else {
      // Older browsers
      mediaQuery.addListener(handler);
    }

    // Update matches in case it changes between render and useEffect
    setMatches(mediaQuery.matches);

    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        // Modern browsers
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}