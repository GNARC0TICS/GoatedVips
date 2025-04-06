/**
 * Goated API Service
 * 
 * This service handles all interactions with the Goated.com API,
 * providing a clean interface for the rest of the application.
 */

import fetch from 'node-fetch';

// Define the shape of the Goated API User
export interface GoatedApiUser {
  id: string;
  name: string;
  avatar?: string;
  wager?: {
    all_time: number;
    monthly: number;
    weekly: number;
    daily: number;
  };
  [key: string]: any; // For additional properties
}

class GoatedApiService {
  private baseUrl: string;
  private apiToken: string | null;
  
  constructor() {
    this.baseUrl = process.env.GOATED_API_URL || 'https://api.goated.com';
    this.apiToken = process.env.API_TOKEN || null;
    
    if (!this.apiToken) {
      console.warn('WARNING: No API_TOKEN environment variable set. Goated API requests will fail.');
    }
  }
  
  /**
   * Find a user by their Goated ID
   */
  async findUserByGoatedId(goatedId: string): Promise<GoatedApiUser | null> {
    try {
      if (!this.apiToken) {
        throw new Error('API token not configured');
      }
      
      const response = await fetch(`${this.baseUrl}/users/${goatedId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // User not found is a normal condition
          return null;
        }
        
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const userData = await response.json() as GoatedApiUser;
      return userData;
    } catch (error) {
      console.error('Error fetching user from Goated API:', error);
      return null;
    }
  }
  
  /**
   * Get a user's wager data by their Goated ID
   */
  async getUserWagerData(goatedId: string): Promise<GoatedApiUser['wager'] | null> {
    try {
      const user = await this.findUserByGoatedId(goatedId);
      return user?.wager || null;
    } catch (error) {
      console.error('Error fetching user wager data:', error);
      return null;
    }
  }
  
  /**
   * Check if the API is accessible
   */
  async checkApiStatus(): Promise<{ healthy: boolean; message: string }> {
    try {
      if (!this.apiToken) {
        return {
          healthy: false,
          message: 'API token not configured'
        };
      }
      
      const response = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          healthy: false,
          message: `API Error (${response.status}): ${errorText}`
        };
      }
      
      return {
        healthy: true,
        message: 'API is accessible'
      };
    } catch (error) {
      return {
        healthy: false,
        message: `API connection error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// Export a singleton instance of the service
const goatedApiService = new GoatedApiService();
export default goatedApiService;