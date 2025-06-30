import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
  cacheTime?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// Default cache times
const CACHE_TIMES = {
  SHORT: 1000 * 30, // 30 seconds
  MEDIUM: 1000 * 60 * 2, // 2 minutes
  LONG: 1000 * 60 * 5, // 5 minutes
};

// Auth token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

// Consolidated fetch function with error handling and retry logic
async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000;

  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, attempt))
        );
      }
    }
  }
  throw lastError;
}

// Hook for affiliate stats with optimized caching
export function useAffiliateStats(username?: string, options: ApiOptions = {}) {
  const endpoint = username 
    ? `/api/affiliate/stats?username=${encodeURIComponent(username)}`
    : '/api/affiliate/stats';

  return useQuery({
    queryKey: ['affiliate-stats', username],
    queryFn: () => fetchApi(endpoint),
    staleTime: CACHE_TIMES.MEDIUM,
    cacheTime: CACHE_TIMES.LONG,
    refetchInterval: username ? false : 30000, // Only poll for global stats
    retry: 2,
    ...options,
  });
}

// Hook for current wager race data
export function useCurrentWagerRace(options: ApiOptions = {}) {
  return useQuery({
    queryKey: ['current-race'],
    queryFn: () => fetchApi('/api/wager-races/current'),
    staleTime: CACHE_TIMES.MEDIUM,
    cacheTime: CACHE_TIMES.LONG,
    refetchInterval: 60000, // Reduced from 30s to 60s
    retry: 2,
    ...options,
  });
}

// Hook for chat messages
export function useChatMessages(options: ApiOptions = {}) {
  return useQuery({
    queryKey: ['chat-messages'],
    queryFn: () => fetchApi('/api/chat/messages'),
    staleTime: CACHE_TIMES.SHORT,
    cacheTime: CACHE_TIMES.MEDIUM,
    refetchInterval: 10000, // Increased from 5s to 10s
    ...options,
  });
}

// Hook for sending chat messages
export function useSendChatMessage() {
  return useMutation({
    mutationFn: (message: string) =>
      fetchApi('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  });
}

// Hook for analytics data with aggressive caching
export function useAnalytics(options: ApiOptions = {}) {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetchApi('/api/admin/analytics'),
    staleTime: CACHE_TIMES.LONG,
    cacheTime: CACHE_TIMES.LONG,
    refetchInterval: 300000, // 5 minutes
    ...options,
  });
}

// Batch request hook for multiple endpoints
export function useBatchRequest(requests: string[], options: ApiOptions = {}) {
  return useQuery({
    queryKey: ['batch', requests],
    queryFn: () =>
      fetchApi('/api/batch', {
        method: 'POST',
        body: JSON.stringify({ requests }),
      }),
    staleTime: CACHE_TIMES.MEDIUM,
    retry: 2,
    ...options,
  });
}

// Authentication hooks
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      if (data.success && data.data?.tokens?.accessToken) {
        setAuthToken(data.data.tokens.accessToken);
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: { username: string; email: string; password: string }) =>
      fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () =>
      fetchApi('/api/auth/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      setAuthToken(null);
      queryClient.clear();
    },
  });
}

// User data hooks
export function useCurrentUser(options: ApiOptions = {}) {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => fetchApi('/api/auth/me'),
    staleTime: CACHE_TIMES.MEDIUM,
    retry: false, // Don't retry auth requests
    ...options,
  });
}

// Generic API mutation hook
export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  return useMutation<ApiResponse<TData>, Error, TVariables>({
    mutationFn: (variables: TVariables) =>
      fetchApi(endpoint, {
        method,
        body: JSON.stringify(variables),
      }),
  });
}

// Export the fetchApi function for direct use
export { fetchApi };