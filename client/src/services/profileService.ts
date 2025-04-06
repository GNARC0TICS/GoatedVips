/**
 * Profile Service
 * 
 * A centralized service for managing user profiles. This service handles
 * loading user data, checking permissions, and caching profile information.
 */

import { z } from "zod";

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
   */
  isProfileOwner(profileId: string | number): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.id === parseInt(String(profileId));
  }

  /**
   * Fetch a user profile by ID
   */
  async getProfile(userId: string): Promise<Profile> {
    // Check cache first
    const cacheKey = String(userId);
    const cachedProfile = this.profileCache.get(cacheKey);

    if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_TIME.PROFILE) {
      return cachedProfile.data;
    }

    // Fetch from API
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
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
  }

  /**
   * Get profile with additional stats
   */
  async getProfileWithStats(userId: string): Promise<ProfileWithStats> {
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
}

// Export a singleton instance
export const profileService = new ProfileService();