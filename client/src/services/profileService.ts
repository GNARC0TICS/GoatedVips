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
import { getTierFromWager, getTierProgress } from "@/lib/tier-utils";

export interface UserProfile {
  id: string;
  username: string;
  totalWagered: string | number;
  weeklyWagered: string | number;
  monthlyWagered: string | number;
  bio?: string;
  profileColor?: string;
  goatedId?: string;
  telegramUsername?: string;
  createdAt: string;
  goatedAccountLinked?: boolean;
  tier?: string;
}

export interface ProfileUpdateData {
  bio?: string;
  profileColor?: string;
  [key: string]: any; // For additional fields
}

/**
 * Fetch a user profile by ID
 * Tries multiple endpoints to resolve the profile
 * 
 * @param userId User ID to fetch
 * @returns User profile data
 * @throws Error if profile cannot be found or created
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  try {
    // Try primary user profile endpoint
    const response = await fetch(`/users/${userId}`);
    if (response.ok) {
      return await response.json();
    }
    
    // If numeric ID failed, try fetching by Goated ID
    if (/^\d+$/.test(userId)) {
      console.log("Trying to fetch by Goated ID:", userId);
      const goatedResponse = await fetch(`/users/by-goated-id/${userId}`);
      if (goatedResponse.ok) {
        return await goatedResponse.json();
      }
    }
    
    // If still not found, try to create a user profile
    console.log("User not found, attempting auto-creation");
    const createResponse = await fetch(`/users/ensure-profile-from-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (createResponse.ok) {
      const createdData = await createResponse.json();
      // If profile was successfully created, fetch it
      if (createdData.success) {
        const newProfileResponse = await fetch(`/users/${createdData.id || userId}`);
        if (newProfileResponse.ok) {
          return await newProfileResponse.json();
        }
      }
    }
    
    throw new Error('Failed to fetch or create user data');
  } catch (error) {
    console.error("User profile error:", error);
    throw error;
  }
}

/**
 * Fetch user statistics for a profile
 * 
 * @param userId User ID to fetch stats for
 * @returns User statistics
 */
export async function fetchUserStats(userId: string): Promise<Omit<UserProfile, 'id' | 'username'>> {
  try {
    const response = await fetch(`/api/users/${userId}/stats`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching user stats:", error);
  }
  
  // Fallback data structure if API fails or is not implemented yet
  return {
    totalWagered: "0.00000000",
    weeklyWagered: "0.00000000",
    monthlyWagered: "0.00000000",
    tier: "bronze",
    createdAt: new Date().toISOString(),
    goatedAccountLinked: false
  };
}

/**
 * Update a user profile
 * 
 * @param userId User ID to update
 * @param data Profile data to update
 * @returns Updated profile data
 */
export async function updateUserProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {
  const response = await fetch(`/users/${userId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Profile update failed" }));
    throw new Error(errorData.message || "Profile update failed");
  }

  // Invalidate related queries
  queryClient.invalidateQueries({ queryKey: [`/users/${userId}`] });
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/stats`] });
  
  return await response.json();
}

/**
 * Format a currency value for display
 * 
 * @param value Value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: string | number): string {
  return typeof value === 'string' ? 
    parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * Get a user's complete profile with combined data
 * Fetches both profile and stats data and merges them
 * 
 * @param userId User ID to fetch
 * @returns Complete user profile
 */
export async function getCompleteUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userProfile = await fetchUserProfile(userId);
    const userStats = await fetchUserStats(userId);
    
    // Combine profile and stats data
    return {
      ...userProfile,
      ...userStats,
      tier: userStats.tier || getTierFromWager(userStats.totalWagered)
    };
  } catch (error) {
    console.error("Error fetching complete profile:", error);
    return null;
  }
}

/**
 * Request profile verification
 * 
 * @param data Verification request data
 * @returns Response from verification request
 */
export async function requestVerification(data: {
  userId?: number;
  goatedId: string;
  goatedUsername: string;
  telegramId: string;
  telegramUsername: string;
  notes?: string;
}): Promise<any> {
  const response = await fetch('/api/verification/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Verification request failed" }));
    throw new Error(errorData.message || "Verification request failed");
  }
  
  return await response.json();
}

/**
 * Check verification status for a user
 * 
 * @param goatedId Goated ID to check verification for
 * @returns Verification status response
 */
export async function checkVerificationStatus(goatedId: string): Promise<any> {
  const response = await fetch(`/api/verification/status/${goatedId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Verification status check failed" }));
    throw new Error(errorData.message || "Verification status check failed");
  }
  
  return await response.json();
}

/**
 * Determines if the current user is the owner of a profile
 * 
 * @param currentUserId The ID of the currently logged-in user
 * @param profileUserId The ID of the profile being viewed
 * @returns Boolean indicating if the current user owns the profile
 */
export function isProfileOwner(currentUserId?: number | null, profileUserId?: string | number | null): boolean {
  if (!currentUserId || !profileUserId) return false;
  
  // Handle string vs number ID comparison
  const profileId = typeof profileUserId === 'string' ? parseInt(profileUserId, 10) : profileUserId;
  return !isNaN(profileId) && currentUserId === profileId;
}
