// API service for v2.0 backend
const API_BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get default headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        code: 'NETWORK_ERROR',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.tokens) {
      this.setToken(response.data.tokens.accessToken);
    }

    return response;
  }

  async register(username: string, email: string, password: string) {
    const response = await this.request<{
      user: any;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data?.tokens) {
      this.setToken(response.data.tokens.accessToken);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.setToken(null);
    return response;
  }

  // User methods
  async getUserProfile(userId: string) {
    return this.request<{ user: any }>(`/users/${userId}`);
  }

  // Leaderboard methods
  async getLeaderboard(page = 1, limit = 10) {
    return this.request<{
      leaderboard: any[];
      pagination: any;
      lastUpdated: string;
    }>(`/leaderboard?page=${page}&limit=${limit}`);
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  // API info
  async getApiInfo() {
    return this.request('/');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;