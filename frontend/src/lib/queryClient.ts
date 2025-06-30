import { QueryClient, QueryKey, QueryClientConfig } from "@tanstack/react-query";

/**
 * Network request types
 */
export type ApiErrorResponse = {
  success: false;
  error: {
    code: number;
    message: string;
    context?: Record<string, any>;
  };
};

export type ApiSuccessResponse<T = any> = {
  success: true;
  data: T;
};

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

interface ApiRequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
  useAuth?: boolean;
}

/**
 * Enhanced API request function with better error handling
 * and response normalization
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    cache = 'default',
    useAuth = true,
  } = options;

  // Default headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
    cache,
    ...(useAuth ? { credentials: 'include' } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    // Network-level error handling
    const response = await fetch(endpoint, config);
    const contentType = response.headers.get('content-type');

    // Parse response based on content type
    let data: any;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Check for API-level errors
    if (!response.ok) {
      // If we have a structured error response, use it
      if (typeof data === 'object' && data?.error) {
        throw new Error(data.error.message || 'API request failed');
      }
      // Otherwise create a generic error
      throw new Error(`${response.status}: ${typeof data === 'string' ? data : 'Unknown error'}`);
    }

    return data as T;
  } catch (error) {
    // Enhance error with additional context
    if (error instanceof Error) {
      // Add request context to the error
      (error as any).endpoint = endpoint;
      (error as any).method = method;
    }
    throw error;
  }
}

/**
 * Create a queryFn for React Query that uses our enhanced apiRequest
 */
export function createQueryFn(options: { 
  shouldReturnNullOn401?: boolean,
  useMemoryCache?: boolean 
} = {}) {
  return async ({ queryKey }: { queryKey: QueryKey }): Promise<any> => {
    const { shouldReturnNullOn401 = false, useMemoryCache = false } = options;

    try {
      // Build the endpoint from the queryKey
      // If the first item is a string and starts with /, use it as the endpoint
      const endpoint = typeof queryKey[0] === 'string' && queryKey[0].startsWith('/')
        ? queryKey[0]
        : `/api/${queryKey.join('/')}`;

      // Add params if they exist in queryKey
      const params = queryKey.length > 1 && typeof queryKey[1] === 'object' 
        ? queryKey[1] 
        : undefined;

      const url = params 
        ? `${endpoint}?${new URLSearchParams(params as Record<string, string>).toString()}`
        : endpoint;

      console.log(`[QueryClient] Fetching: ${url}`);

      return await apiRequest(url);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error && error.message.includes('401') && shouldReturnNullOn401) {
        return null;
      }

      // Rethrow the error for React Query to handle
      throw error;
    }
  };
}

/**
 * Optimized QueryClient configuration
 * - Improved error handling
 * - Better retry logic with exponential backoff
 * - Automatic background refetching
 */
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      queryFn: createQueryFn(),
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 401
        if (error instanceof Error && error.message.includes('4')) {
          const status = parseInt(error.message.match(/(\d{3})/)?.[1] || '0');
          if (status >= 400 && status < 500 && status !== 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 2 * 60 * 1000,      // 2 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      refetchOnWindowFocus: true,    // Refetch when window regains focus
      refetchOnReconnect: true,      // Refetch when network reconnects
      refetchOnMount: true,          // Refetch when component mounts
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Only retry network/server errors, not validation errors
        if (
          error.message?.includes('401') || 
          error.message?.includes('403') || 
          error.message?.includes('422')
        ) {
          return false;
        }
        return failureCount < 2;
      },
      // Don't cache mutations
      gcTime: 0,
    },
  },
};

// Create the QueryClient instance
export const queryClient = new QueryClient(queryClientConfig);