/**
 * Profile Service
 * 
 * A centralized service for managing user profiles.
 * This service:
 * 1. Encapsulates API calls to profile endpoints
 * 2. Handles profile data transformation
 * 3. Provides utilities for profile state management
 * 4. Manages profile-related errors
 * 
 * Using this service helps maintain consistent profile behavior
 * throughout the application and reduces code duplication.
 */

import { queryClient } from "@/lib/queryClient";
import { getTierFromWager } from "@/lib/tier-utils";
import { z } from "zod";

// Profile schema for validation
export const UserProfileSchema = z.object({
  id: z.string().or(z.number()).transform(val => String(val)),
  username: z.string(),
  totalWager: z.union([z.string(), z.number()]).optional().default("0"),
  bio: z.string().optional(),
  profileColor: z.string().optional(),
  goatedId: z.string().optional(),
  goatedUsername: z.string().optional(),
  email: z.string().optional(),
  createdAt: z.string().optional(),
  lastActive: z.string().optional(),
  goatedAccountLinked: z.boolean().optional(),
  tier: z.string().optional(),
  avatarUrl: z.string().optional(),
  isVerified: z.boolean().optional()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export interface ProfileUpdateData {
  bio?: string;
  profileColor?: string;
  [key: string]: any; // For additional fields
}

/**
 * Error class for profile-related errors
 */
export class ProfileError extends Error {
  public code: string;
  
  constructor(message: string, code = 'PROFILE_ERROR') {
    super(message);
    this.name = 'ProfileError';
    this.code = code;
  }
}

class ProfileService {
  private baseUrl: string;
  private enableCaching: boolean;
  private cacheDuration: number;
  private cache: Map<string, { data: any, timestamp: number }>;
  private currentUser: UserProfile | null = null;

  constructor(options: {
    baseUrl?: string;
    enableCaching?: boolean;
    cacheDuration?: number;
  } = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.enableCaching = options.enableCaching ?? true;
    this.cacheDuration = options.cacheDuration || 60000; // 1 minute in ms
    this.cache = new Map();
  }

  /**
   * Set the current authenticated user
   * This is used to determine profile ownership
   */
  setCurrentUser(user: UserProfile | null | undefined) {
    this.currentUser = user || null;
  }

  /**
   * Check if the specified profile is owned by the current user
   */
  isProfileOwner(profileId: string | number): boolean {
    if (!this.currentUser) return false;
    
    // Convert both to strings for comparison
    const currentId = String(this.currentUser.id);
    const targetId = String(profileId);
    
    // Check if the primary ID matches
    const idMatch = currentId === targetId;
    
    // Check if the goatedId matches, if it exists
    let goatedIdMatch = false;
    if (this.currentUser.goatedId) {
      goatedIdMatch = this.currentUser.goatedId === targetId;
    }
    
    return idMatch || goatedIdMatch;
  }

  /**
   * Get a profile from the cache or fetch it from the API
   */
  async getProfile(userId: string | number): Promise<UserProfile> {
    const cacheKey = `profile-${userId}`;
    
    // Check if we have a cached version and it's still valid
    if (this.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return UserProfileSchema.parse(cached.data);
      }
    }
    
    try {
      // Try to fetch from primary profile endpoint
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate and transform data
        const validatedData = UserProfileSchema.parse(data);
        
        // Cache the result
        if (this.enableCaching) {
          this.cache.set(cacheKey, {
            data: validatedData,
            timestamp: Date.now()
          });
        }
        
        return validatedData;
      }
      
      // If that fails, try the alternate endpoint that ensures a profile exists
      const fallbackResponse = await fetch(`${this.baseUrl}/users/ensure/${userId}`);
      
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        
        // Validate and transform data
        const validatedData = UserProfileSchema.parse(data);
        
        // Cache the result
        if (this.enableCaching) {
          this.cache.set(cacheKey, {
            data: validatedData,
            timestamp: Date.now()
          });
        }
        
        return validatedData;
      }
      
      throw new ProfileError(
        `Failed to fetch profile: ${fallbackResponse.status} ${fallbackResponse.statusText}`,
        'PROFILE_NOT_FOUND'
      );
    } catch (error) {
      if (error instanceof ProfileError) {
        throw error;
      }
      
      console.error("Error fetching profile:", error);
      throw new ProfileError(
        `Error fetching profile: ${error instanceof Error ? error.message : String(error)}`,
        'PROFILE_FETCH_ERROR'
      );
    }
  }

  /**
   * Update a user profile
   */
  async updateProfile(userId: string | number, data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Profile update failed" }));
        throw new ProfileError(
          errorData.message || "Profile update failed",
          'PROFILE_UPDATE_ERROR'
        );
      }

      const updatedData = await response.json();
      
      // Validate the response
      const validatedData = UserProfileSchema.parse(updatedData);
      
      // Update cache
      const cacheKey = `profile-${userId}`;
      if (this.enableCaching) {
        this.cache.set(cacheKey, {
          data: validatedData,
          timestamp: Date.now()
        });
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      
      return validatedData;
    } catch (error) {
      if (error instanceof ProfileError) {
        throw error;
      }
      
      console.error("Error updating profile:", error);
      throw new ProfileError(
        `Error updating profile: ${error instanceof Error ? error.message : String(error)}`,
        'PROFILE_UPDATE_ERROR'
      );
    }
  }

  /**
   * Request to link a Goated.com account by username to the user profile
   * This initiates the admin approval process
   */
  async requestGoatedAccountLink(goatedUsername: string): Promise<{ success: boolean; message: string; username?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/account/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goatedUsername }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Account linking request failed" }));
        throw new ProfileError(
          errorData.message || "Account linking request failed",
          'ACCOUNT_LINK_REQUEST_ERROR'
        );
      }

      // Clear cache entries for current user
      if (this.currentUser) {
        this.clearCache(this.currentUser.id);
      }
      
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      return await response.json();
    } catch (error) {
      console.error("Error requesting account link:", error);
      throw error instanceof ProfileError 
        ? error 
        : new ProfileError(
            `Error requesting account link: ${error instanceof Error ? error.message : String(error)}`,
            'ACCOUNT_LINK_REQUEST_ERROR'
          );
    }
  }
  
  /**
   * Check if a Goated username exists and can be linked
   */
  async checkGoatedUsername(username: string): Promise<{
    exists: boolean;
    goatedId?: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/account/check-goated-username/${username}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Username check failed" }));
        throw new ProfileError(
          errorData.message || "Username check failed",
          'USERNAME_CHECK_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking username:", error);
      throw error instanceof ProfileError 
        ? error 
        : new ProfileError(
            `Error checking username: ${error instanceof Error ? error.message : String(error)}`,
            'USERNAME_CHECK_ERROR'
          );
    }
  }

  /**
   * Unlink a Goated.com account from the user profile
   */
  async unlinkGoatedAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/account/unlink-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Account unlinking failed" }));
        throw new ProfileError(
          errorData.message || "Account unlinking failed",
          'ACCOUNT_UNLINK_ERROR'
        );
      }

      // Clear cache entries for current user
      if (this.currentUser) {
        this.clearCache(this.currentUser.id);
      }
      
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      return await response.json();
    } catch (error) {
      console.error("Error unlinking account:", error);
      throw error instanceof ProfileError 
        ? error 
        : new ProfileError(
            `Error unlinking account: ${error instanceof Error ? error.message : String(error)}`,
            'ACCOUNT_UNLINK_ERROR'
          );
    }
  }

  /**
   * Check if a Goated ID exists and is available for linking
   */
  async checkGoatedId(goatedId: string): Promise<{
    success: boolean;
    canLink: boolean;
    goatedUsername?: string;
    reason?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/account/check-goated-id/${goatedId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Goated ID check failed" }));
        throw new ProfileError(
          errorData.message || "Goated ID check failed",
          'GOATED_ID_CHECK_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking Goated ID:", error);
      throw error instanceof ProfileError 
        ? error 
        : new ProfileError(
            `Error checking Goated ID: ${error instanceof Error ? error.message : String(error)}`,
            'GOATED_ID_CHECK_ERROR'
          );
    }
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/verification/request-email`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Email verification request failed" }));
        throw new ProfileError(
          errorData.message || "Email verification request failed",
          'EMAIL_VERIFICATION_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error requesting email verification:", error);
      throw error instanceof ProfileError 
        ? error 
        : new ProfileError(
            `Error requesting email verification: ${error instanceof Error ? error.message : String(error)}`,
            'EMAIL_VERIFICATION_ERROR'
          );
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/verification/verify-email/${token}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Email verification failed" }));
        throw new ProfileError(
          errorData.message || "Email verification failed",
          'EMAIL_VERIFICATION_ERROR'
        );
      }

      // Invalidate user queries after successful verification
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      return await response.json();
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error instanceof ProfileError 
        ? error 
        : new ProfileError(
            `Error verifying email: ${error instanceof Error ? error.message : String(error)}`,
            'EMAIL_VERIFICATION_ERROR'
          );
    }
  }

  /**
   * Format a currency value for display
   */
  formatCurrency(value: string | number): string {
    if (typeof value === 'string') {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) return "0.00";
      return parsedValue.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
    }
    
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  }

  /**
   * Clear the cache for specific profile or all profiles
   */
  clearCache(profileId?: string | number) {
    if (profileId) {
      this.cache.delete(`profile-${profileId}`);
    } else {
      this.cache.clear();
    }
  }
}

// Create and export a singleton instance
export const profileService = new ProfileService();

export default profileService;