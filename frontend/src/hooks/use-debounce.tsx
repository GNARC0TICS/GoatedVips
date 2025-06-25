import { useState, useEffect } from 'react';

/**
 * A hook that provides a debounced value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up on unmount or value/delay change
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}