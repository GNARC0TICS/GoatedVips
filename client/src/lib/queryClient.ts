import { QueryClient, QueryKey, DefaultOptions } from "@tanstack/react-query";
import { z } from "zod";

/**
 * QueryKey structure definition
 * 
 * Ensures consistent query key patterns throughout the application for better
 * cache management, invalidation, and prefetching.
 * 
 * Format: [resourceType, id?, subresource?, params?]
 * Examples: 
 * - ['users']: All users
 * - ['users', '123']: Single user with ID 123
 * - ['users', '123', 'stats']: Stats for user 123
 * - ['races', 'active']: Active races
 */
export enum QueryKeys {
  USERS = 'users',
  USER_PROFILE = 'userProfile',
  AUTH = 'auth',
  LEADERBOARD = 'leaderboard',
  WAGER_RACES = 'wagerRaces',
  BONUS_CODES = 'bonusCodes',
  WHEEL_SPINS = 'wheelSpins',
  STATS = 'stats',
  NOTIFICATIONS = 'notifications',
  SUPPORT = 'support',
  VERIFICATION = 'verification'
}

// Common error types for better error handling
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// API response validation schema
const apiResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.any().optional(),
});

type GetQueryFnOptions = {
  on401?: "throw" | "returnNull";
};

/**
 * Enhanced API request function with improved error handling
 * 
 * @param method - HTTP method
 * @param endpoint - API endpoint
 * @param body - Request body (optional)
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  try {
    const response = await fetch(endpoint, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept": "application/json"
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    // If response is a 401, try to refresh token (in case of JWT implementation)
    if (response.status === 401) {
      const refreshResult = await refreshAuthToken();
      if (refreshResult.success) {
        // Retry the original request with new token
        return apiRequest(method, endpoint, body);
      }
    }

    if (!response.ok) {
      // Try to parse error as JSON
      let errorData: ApiError = {
        status: response.status,
        message: "Unknown error occurred"
      };
      
      try {
        const errorText = await response.text();
        try {
          const jsonError = JSON.parse(errorText);
          errorData = {
            status: response.status,
            message: jsonError.message || jsonError.error || "An error occurred",
            code: jsonError.code,
            details: jsonError.details
          };
        } catch {
          // If not JSON, use the text directly
          errorData.message = errorText;
        }
      } catch {
        // If we can't read the response, use a generic error
        errorData.message = `Request failed with status: ${response.status}`;
      }
      
      throw new Error(JSON.stringify(errorData));
    }

    return response;
  } catch (error) {
    // Re-throw with more context for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(JSON.stringify({
        status: 0,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      }));
    }
    throw error;
  }
}

/**
 * Attempts to refresh the auth token
 * 
 * @returns Object indicating success/failure of refresh attempt
 */
export async function refreshAuthToken(): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return { success: response.ok };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return { success: false };
  }
}

/**
 * Enhanced query function factory with improved caching, 
 * error handling, and automatic token refresh
 */
export function getQueryFn({ on401 = "throw" }: GetQueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: QueryKey }) => {
    try {
      // Generate cache key from the full query key structure
      const cacheKey = `goatedvips-query-${Array.isArray(queryKey) ? JSON.stringify(queryKey) : String(queryKey)}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isStale = Date.now() - timestamp > 60000; // 1 minute stale time

        if (!isStale) {
          return data;
        }
      }

      // Handle different query key formats
      let endpoint: string;
      if (Array.isArray(queryKey) && queryKey.length > 0) {
        if (typeof queryKey[0] === 'string' && queryKey[0].startsWith('/')) {
          // Legacy format: ['/api/endpoint']
          endpoint = queryKey[0];
        } else {
          // New format: [resource, id?, subresource?]
          endpoint = constructEndpoint(queryKey);
        }
      } else {
        throw new Error('Invalid query key format');
      }

      const res = await apiRequest("GET", endpoint);

      // Validate response format
      const data = await res.json();
      try {
        apiResponseSchema.parse(data);
      } catch (e) {
        console.warn('API response does not match expected schema:', e);
      }

      // Store in cache
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      return data.data || data; // Prefer data.data if available (standard API response)
    } catch (error) {
      console.error("Query error:", error);
      // Parse the error message if it's a stringified JSON
      if (error instanceof Error && error.message.startsWith('{')) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.status === 401 && on401 === "returnNull") {
            return null;
          }
        } catch {
          // Ignore parsing error
        }
      }
      throw error;
    }
  };
}

/**
 * Constructs an API endpoint from a query key array
 * 
 * @param queryKey - The query key array
 * @returns Formatted API endpoint string
 */
function constructEndpoint(queryKey: QueryKey): string {
  // Handle resource-based query key format: [resource, id?, subresource?]
  if (queryKey.length === 0) throw new Error('Empty query key');
  
  const [resource, id, subresource, ...rest] = queryKey;
  let endpoint = `/api/${resource}`;
  
  if (id !== undefined) endpoint += `/${id}`;
  if (subresource !== undefined) endpoint += `/${subresource}`;
  
  // Add query params if the last item is an object
  const lastItem = rest.length > 0 ? rest[rest.length - 1] : null;
  if (lastItem && typeof lastItem === 'object' && !Array.isArray(lastItem)) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(lastItem)) {
      params.append(key, String(value));
    }
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
  }
  
  return endpoint;
}

/**
 * Default query client options with optimized settings
 */
const defaultOptions: DefaultOptions = {
  queries: {
    queryFn: getQueryFn(),
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors or after 3 failures
      if (typeof error === 'string' && error.includes('"status":401')) return false;
      if (error instanceof Error && error.message.includes('"status":401')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  },
  mutations: {
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors or after 2 failures
      if (typeof error === 'string' && error.includes('"status":401')) return false;
      if (error instanceof Error && error.message.includes('"status":401')) return false;
      return failureCount < 2;
    },
    onError: (error, variables, context) => {
      console.error('Mutation error:', error, 'Variables:', variables, 'Context:', context);
    }
  },
};

/**
 * Centralized Query Client with enhanced configuration
 */
export const queryClient = new QueryClient({
  defaultOptions
});