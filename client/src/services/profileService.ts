/**
 * Profile Service
 * 
 * A centralized service for managing user profiles. This service handles
 * loading user data, checking permissions, and caching profile information.
 */

import { z } from "zod";

/**
 * Custom error class for profile-related errors
 */
export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

// Profile schema
export const ProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  goatedId: z.string().nullable().optional(),
  goatedUsername: z.string().nullable().optional(),
  goatedAccountLinked: z.boolean().optional(),
  email: z.string().optional(),
  bio: z.string().nullable().optional(),
  profileColor: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  lastActive: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  goatedLinkRequested: z.boolean().optional(),
  goatedUsernameRequested: z.string().nullable().optional(),
  totalWager: z.string().nullable().optional(),
  tier: z.string().nullable().optional(),
});

// Extended profile with stats
export const ProfileWithStatsSchema = ProfileSchema.extend({
  stats: z.object({
    wagered: z.object({
      allTime: z.number().optional(),
      monthly: z.number().optional(),
      weekly: z.number().optional(),
      daily: z.number().optional(),
    }).optional(),
    challenges: z.object({
      completed: z.number().optional(),
      active: z.number().optional(),
    }).optional(),
  }).optional(),
});

// Export types
export type Profile = z.infer<typeof ProfileSchema>;
export type UserProfile = Profile; // Alias for backward compatibility
export type ProfileWithStats = z.infer<typeof ProfileWithStatsSchema>;

// Cache time constants
const CACHE_TIME = {
  PROFILE: 5 * 60 * 1000, // 5 minutes
  STATS: 2 * 60 * 1000,   // 2 minutes
};

class ProfileService {
  private profileCache: Map<string, { data: Profile; timestamp: number }> = new Map();
  private currentUser: Profile | null = null;

  /**
   * Set the current authenticated user
   */
  setCurrentUser(user: Profile | null) {
    this.currentUser = user;

    // If we have a user, add them to cache
    if (user) {
      this.profileCache.set(String(user.id), {
        data: user,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  /**
   * Check if a profile is owned by the current user
   * Safely handles both string and numeric IDs
   */
  isProfileOwner(profileId: string | number): boolean {
    if (!this.currentUser) return false;
    
    // Convert both to strings for comparison when profileId is a non-numeric string
    if (typeof profileId === 'string' && !/^\d+$/.test(profileId)) {
      // Handle non-numeric string IDs (like goatedId)
      return this.currentUser.goatedId === profileId;
    }
    
    // For numeric IDs (both number type and numeric strings)
    const numericProfileId = typeof profileId === 'string' ? parseInt(profileId, 10) : profileId;
    return this.currentUser.id === numericProfileId;
  }

  /**
   * Fetch a user profile by ID
   * Handles both string and number IDs appropriately
   */
  async getProfile(userId: string | number): Promise<Profile> {
    if (!userId) {
      throw new ProfileError('No user ID provided');
    }
    
    // Check cache first
    const cacheKey = String(userId);
    const cachedProfile = this.profileCache.get(cacheKey);

    if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_TIME.PROFILE) {
      return cachedProfile.data;
    }

    // Fetch from API - pass the ID as-is to the server
    // The server will determine if it's a numeric ID or GoatedID
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        // Add more detailed error messages
        if (response.status === 404) {
          throw new ProfileError(`User profile not found for ID: ${userId}`);
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profileData = await response.json();

      // Validate with schema
      const validatedProfile = ProfileSchema.parse(profileData);

      // Update cache
      this.profileCache.set(cacheKey, {
        data: validatedProfile,
        timestamp: Date.now(),
      });

      return validatedProfile;
    } catch (error) {
      console.error(`Error fetching profile for ID ${userId}:`, error);
      if (error instanceof ProfileError) {
        throw error;
      } else if (error instanceof Error) {
        throw new ProfileError(error.message);
      } else {
        throw new ProfileError(`Failed to fetch profile for ID: ${userId}`);
      }
    }
  }

  /**
   * Get profile with additional stats
   */
  async getProfileWithStats(userId: string | number): Promise<ProfileWithStats> {
    // Get base profile
    const profile = await this.getProfile(userId);

    // Fetch additional stats if needed
    const statsResponse = await fetch(`/api/users/${userId}/stats`);

    if (!statsResponse.ok) {
      // Return profile without stats if stats fetch fails
      return profile;
    }

    const statsData = await statsResponse.json();

    // Combine and return
    return {
      ...profile,
      stats: statsData,
    };
  }

  /**
   * Search users by username or other criteria
   */
  async searchUsers(query: string): Promise<Profile[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const searchResults = await response.json();
    return searchResults.map((user: any) => ProfileSchema.parse(user));
  }

  /**
   * Update a user profile
   * Only works for the current user or admins
   */
  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    if (!this.isProfileOwner(userId) && !this.currentUser?.isAdmin) {
      throw new Error("You don't have permission to update this profile");
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    const updatedProfile = await response.json();

    // Update cache
    this.profileCache.set(String(userId), {
      data: updatedProfile,
      timestamp: Date.now(),
    });

    return updatedProfile;
  }

  /**
   * Clear the profile cache
   */
  clearCache() {
    this.profileCache.clear();
  }

  /**
   * Remove a specific profile from cache
   */
  invalidateProfileCache(userId: string) {
    this.profileCache.delete(String(userId));
  }
  
  /**
   * Prefetch multiple profiles and store them in cache
   * Useful for lists where you know you'll need multiple profiles
   * 
   * @param userIds - Array of user IDs to prefetch
   * @returns Promise<Map<string, Profile>> - Map of user IDs to profiles
   */
  async prefetchProfiles(userIds: (string | number)[]): Promise<Map<string, Profile>> {
    if (!userIds.length) return new Map();
    
    const uniqueIds = [...new Set(userIds.map(id => String(id)))];
    const result = new Map<string, Profile>();
    const fetchPromises: Promise<void>[] = [];
    
    for (const userId of uniqueIds) {
      // Check if we already have a valid cached entry
      const cacheKey = String(userId);
      const cachedProfile = this.profileCache.get(cacheKey);
      
      if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_TIME.PROFILE) {
        result.set(cacheKey, cachedProfile.data);
        continue;
      }
      
      // Otherwise queue a fetch operation
      const fetchPromise = (async () => {
        try {
          const profile = await this.getProfile(userId);
          result.set(cacheKey, profile);
        } catch (error) {
          console.error(`Failed to prefetch profile ${userId}:`, error);
          // Don't fail the entire batch for a single profile error
        }
      })();
      
      fetchPromises.push(fetchPromise);
    }
    
    // Wait for all fetches to complete
    await Promise.all(fetchPromises);
    return result;
  }
}

// Export a singleton instance
export const profileService = new ProfileService();