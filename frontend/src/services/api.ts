
import { z } from "zod";

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types for API responses
export interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginResponse {
  user: ApiUser;
  token: string;
}

export interface RegisterResponse {
  user: ApiUser;
  token: string;
}

/**
 * Core API service for making HTTP requests
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    // Use the current origin for API requests
    this.baseUrl = window.location.origin;
  }

  /**
   * Make an authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Get token from localStorage if available
      const token = localStorage.getItem('auth-token');
      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token if login successful
    if (response.success && response.data?.token) {
      localStorage.setItem('auth-token', response.data.token);
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.makeRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    // Store token if registration successful
    if (response.success && response.data?.token) {
      localStorage.setItem('auth-token', response.data.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await this.makeRequest<void>('/api/auth/logout', {
      method: 'POST',
    });

    // Clear token regardless of response
    localStorage.removeItem('auth-token');

    return response;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: ApiUser }>> {
    return this.makeRequest<{ user: ApiUser }>('/api/auth/me');
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.makeRequest<{ token: string }>('/api/auth/refresh', {
      method: 'POST',
    });

    // Update token if refresh successful
    if (response.success && response.data?.token) {
      localStorage.setItem('auth-token', response.data.token);
    }

    return response;
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export for convenience
export default apiService;
