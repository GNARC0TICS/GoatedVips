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
 * - Handles API timeouts gracefully
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
  private lastSuccessfulResponse: any = null;
  private lastFetchTime: number = 0;

  /**
   * Initialize the service with configuration from API_CONFIG
   */
  constructor() {
    this.apiUrl = API_CONFIG.baseUrl;
    this.apiToken = process.env.GOATED_API_TOKEN || process.env.API_TOKEN || API_CONFIG.token;
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
   * @param forceFresh If true, forces a fresh API request even if recently cached
   * @returns Raw JSON data from the API
   */
  async fetchReferralData(forceFresh = false): Promise<any> {
    console.log("Fetching referral data from external API");
    
    if (!this.hasApiToken()) {
      throw new Error("API token is not configured");
    }
    
    try {
      const data = await this.makeApiRequest(forceFresh);
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
   * @param forceFresh If true, forces a fresh API request even if recently cached
   * @returns Parsed JSON response from the API
   * @throws Error if request fails after all retry attempts
   */
  private async makeApiRequest(forceFresh = false): Promise<any> {
    // Only try directly calling the API if forced or no previous success
    const now = Date.now();
    const cacheMaxAge = 15 * 60 * 1000; // 15 minutes
    
    if (!forceFresh && this.lastSuccessfulResponse && (now - this.lastFetchTime < cacheMaxAge)) {
      console.log(`Using cached API response from ${Math.round((now - this.lastFetchTime) / 1000)} seconds ago`);
      return this.lastSuccessfulResponse;
    }
    
    let retryCount = 0;
    let lastError: Error | null = null;
    
    // Ensure URL is properly formatted and includes protocol
    const urlToUse = this.apiUrl.startsWith('http') ? this.apiUrl : `https://${this.apiUrl}`;
    console.log(`Using normalized API URL: ${urlToUse}`);
    
    while (retryCount <= this.maxRetries) {
      try {
        // Log retry information
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}/${this.maxRetries}`);
        } else {
          console.log(`Attempting API request to: ${urlToUse}`);
          // Log token info without revealing full token
          const tokenPreview = this.apiToken.length > 10 
            ? `${this.apiToken.substring(0, 5)}...${this.apiToken.substring(this.apiToken.length - 5)}`
            : this.apiToken.substring(0, 3) + '...';
          console.log(`Using authorization: Bearer ${tokenPreview}`);
        }
        
        // Create a new controller for each attempt
        const controller = new AbortController();
        let timeoutId: NodeJS.Timeout | null = null;
        
        // Set up timeout with proper error handling
        timeoutId = setTimeout(() => {
          console.warn(`Request timeout after ${this.requestTimeout}ms, aborting...`);
          controller.abort();
        }, this.requestTimeout);
        
        console.log(`Starting fetch with timeout of ${this.requestTimeout}ms`);
        
        // First, try to fetch the raw response text
        const response = await fetch(urlToUse, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
            "Accept": "*/*", // Accept any content type
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          signal: controller.signal,
        });
        
        // Clear the timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        console.log(`Received response with status: ${response.status}`);
        
        // Handle HTTP error responses
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error response (${response.status}):`, errorText.substring(0, 200));
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        // Get the raw text response first
        const rawText = await response.text();
        console.log(`Received raw API response (length: ${rawText.length} chars)`);
        
        // Log a sample of the response for debugging
        if (rawText.length > 0) {
          console.log(`Response sample: ${rawText.substring(0, Math.min(200, rawText.length))}...`);
        }
        
        // If empty response, throw error
        if (!rawText || rawText.trim() === '') {
          throw new Error("API returned empty response");
        }
        
        // Try to parse it as JSON
        let data;
        try {
          data = JSON.parse(rawText);
          console.log(`Successfully parsed JSON response with ${response.status} status`);
        } catch (jsonError) {
          console.warn("Failed to parse response as JSON:", String(jsonError));
          console.warn("Raw text sample:", rawText.substring(0, 100) + "...");
          // Return raw text as a fallback
          data = { rawText, parseError: true };
        }
        
        // Update cache with successful response
        this.lastSuccessfulResponse = data;
        this.lastFetchTime = now;
        
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check for different types of errors with better diagnostics
        const isTimeoutError = lastError.name === 'AbortError' || 
                              lastError.message.includes('timeout') || 
                              lastError.message.includes('abort');
        
        const isNetworkError = lastError.message.includes('network') || 
                              lastError.message.includes('fetch') ||
                              lastError.message.includes('connect');
                              
        if (isTimeoutError) {
          console.error(`API request timed out (attempt ${retryCount + 1}/${this.maxRetries + 1})`);
          console.error(`Timeout details: Limit=${this.requestTimeout}ms, Error=${lastError.message}`);
        } else if (isNetworkError) {
          console.error(`Network error (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, lastError.message);
          console.error(`Check network connectivity and API endpoint: ${urlToUse}`);
        } else {
          console.error(`API request failed (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, lastError.message);
        }
        
        // Don't retry if we've hit the max retries
        if (retryCount >= this.maxRetries) {
          console.warn(`Exhausted all ${this.maxRetries + 1} attempts to reach the API`);
          break;
        }
        
        // Sleep with exponential backoff before next retry
        const sleepTime = getSleepTime(retryCount);
        console.log(`Waiting ${sleepTime}ms before next retry...`);
        await sleep(sleepTime);
        
        retryCount++;
      }
    }
    
    // If we have a cached response, return it even though the fresh request failed
    if (this.lastSuccessfulResponse) {
      console.warn("Returning stale cached data because fresh API request failed");
      return this.lastSuccessfulResponse;
    }
    
    // If we've exhausted all retries, throw the last error with diagnostic info
    const errorMessage = lastError ? 
      `API request failed after ${this.maxRetries + 1} attempts: ${lastError.message}` : 
      "API request failed with unknown error";
    
    console.error(`Final error: ${errorMessage}`);
    console.error(`API URL: ${urlToUse}`);
    console.error(`Timeout setting: ${this.requestTimeout}ms`);
    
    throw new Error(errorMessage);
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