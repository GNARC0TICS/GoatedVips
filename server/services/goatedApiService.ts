/**
 * GoatedApiService
 * 
 * This service is responsible for all external API communication with the Goated.com API.
 * It handles authentication, request retries, and error handling, returning raw data
 * from the external API to be processed by the PlatformApiService.
 * 
 * Key features:
 * - Fetches data from the single Goated.com API endpoint
 * - Handles authentication with API token
 * - Implements retry logic with exponential backoff
 * - Provides detailed error logging
 * 
 * This service is intentionally limited to ONLY external API communication, with no
 * data transformation or business logic. All transformation happens in PlatformApiService.
 */

import { API_CONFIG } from "../config/api";

// For exponential backoff in retries
function getSleepTime(retryCount: number, initialDelay = 1000, maxDelay = 60000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc. up to maxDelay
  const delay = Math.min(maxDelay, initialDelay * Math.pow(2, retryCount));
  // Add jitter to prevent all clients retrying at the same time
  return delay * (0.8 + 0.4 * Math.random());
}

// Helper for sleeping
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * External API Service
 * Handles all communication with the external Goated.com API
 */
export class GoatedApiService {
  private apiUrl: string;
  private apiToken: string;
  private requestTimeout: number;
  private maxRetries: number;

  /**
   * Initialize the service with configuration from API_CONFIG
   */
  constructor() {
    this.apiUrl = API_CONFIG.baseUrl;
    this.apiToken = process.env.API_TOKEN || API_CONFIG.token;
    this.requestTimeout = API_CONFIG.request.timeout;
    this.maxRetries = API_CONFIG.request.retries;
    
    console.log(`GoatedApiService initialized with URL: ${this.apiUrl}`);
    // Log token status (without revealing the actual token)
    const hasToken = !!this.apiToken;
    console.log(`API token is ${hasToken ? 'available' : 'NOT available'}`);
  }

  /**
   * Fetches data from the Goated.com API
   * This is the main method that should be called by other services
   * 
   * @returns Raw JSON data from the API
   */
  async fetchReferralData(): Promise<any> {
    console.log("Fetching referral data from external API");
    
    if (!this.hasApiToken()) {
      throw new Error("API token is not configured");
    }
    
    try {
      const data = await this.makeApiRequest();
      return data;
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
      throw error;
    }
  }

  /**
   * Checks if the API token is available
   * Used to prevent unnecessary API calls when no token is configured
   * 
   * @returns boolean indicating if token is available
   */
  hasApiToken(): boolean {
    return !!this.apiToken;
  }

  /**
   * Makes API request with retry logic and proper error handling
   * This is the core method that handles the actual HTTP request
   * 
   * @returns Parsed JSON response from the API
   * @throws Error if request fails after all retry attempts
   */
  private async makeApiRequest(): Promise<any> {
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount <= this.maxRetries) {
      try {
        // Log retry information
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}/${this.maxRetries}`);
        }
        
        // Make the API request
        const response = await fetch(this.apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(this.requestTimeout),
        });
        
        // Handle HTTP error responses
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log(`Successfully fetched data from API with ${response.status} status`);
        
        // Basic validation of the response structure
        if (!data) {
          throw new Error("API returned empty response");
        }
        
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`API request failed (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, lastError.message);
        
        // Don't retry if we've hit the max retries
        if (retryCount >= this.maxRetries) {
          break;
        }
        
        // Sleep with exponential backoff before next retry
        const sleepTime = getSleepTime(retryCount);
        console.log(`Waiting ${sleepTime}ms before next retry...`);
        await sleep(sleepTime);
        
        retryCount++;
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError || new Error("API request failed with unknown error");
  }

  /**
   * Placeholder method for future implementation of profile syncing
   * This is not currently implemented but stubbed for compatibility
   */
  async syncUserProfiles(): Promise<any> {
    console.log("syncUserProfiles method called (placeholder)");
    return {
      created: 0,
      updated: 0,
      existing: 0
    };
  }

  /**
   * Placeholder method for future implementation of wager data updates
   * This is not currently implemented but stubbed for compatibility
   */
  async updateAllWagerData(): Promise<any> {
    console.log("updateAllWagerData method called (placeholder)");
    return 0; // Number of records updated
  }
}

// Create a singleton instance
export default new GoatedApiService();