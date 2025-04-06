import { User } from '@/hooks/use-auth';

export interface Profile extends User {
  goatedId?: string;
  totalWager?: number;
  createdAt?: string;
  lastActive?: string;
  avatarUrl?: string;
  verified?: boolean;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
  };
  stats?: {
    totalWins?: number;
    totalLosses?: number;
    biggestWin?: number;
    winRate?: number;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    privacy?: 'public' | 'private' | 'friends';
  };
}

export interface ProfileServiceOptions {
  baseUrl?: string;
  enableCaching?: boolean;
  cacheDuration?: number;
}

/**
 * Centralized service for handling profile-related operations
 * Provides methods for fetching, updating, and managing user profiles
 */
class ProfileService {
  private baseUrl: string;
  private enableCaching: boolean;
  private cacheDuration: number;
  private cache: Map<string, { data: any, timestamp: number }>;
  private currentUser: User | null = null;

  constructor(options: ProfileServiceOptions = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.enableCaching = options.enableCaching ?? true;
    this.cacheDuration = options.cacheDuration || 60000; // 1 minute in ms
    this.cache = new Map();
  }

  /**
   * Set the current authenticated user
   * This is used to determine profile ownership
   */
  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  /**
   * Check if the specified profile is owned by the current user
   */
  isProfileOwner(profileId: string | number): boolean {
    if (!this.currentUser) return false;
    
    // Check if the primary ID matches
    const idMatch = this.currentUser.id.toString() === profileId.toString();
    
    // Check if the goatedId matches, if it exists
    let goatedIdMatch = false;
    if (typeof this.currentUser.goatedId === 'string') {
      goatedIdMatch = this.currentUser.goatedId === profileId.toString();
    }
    
    return idMatch || goatedIdMatch;
  }

  /**
   * Get a user profile by ID (numerical database ID or goatedId)
   */
  async getProfile(profileId: string | number): Promise<Profile> {
    const cacheKey = `profile-${profileId}`;
    
    // Check cache first if enabled
    if (this.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${profileId}`);
      
      if (!response.ok) {
        throw new Error(
          `Failed to fetch profile: ${response.statusText} (${response.status})`
        );
      }
      
      const data = await response.json();
      
      // Cache the result if caching is enabled
      if (this.enableCaching) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  /**
   * Get current user's own profile
   */
  async getOwnProfile(): Promise<Profile> {
    if (!this.currentUser) {
      throw new Error("No authenticated user");
    }
    
    return this.getProfile(this.currentUser.id);
  }

  /**
   * Update a user profile
   */
  async updateProfile(profileId: string | number, data: Partial<Profile>): Promise<Profile> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(
          `Failed to update profile: ${response.statusText} (${response.status})`
        );
      }
      
      const updatedProfile = await response.json();
      
      // Invalidate cache
      if (this.enableCaching) {
        this.cache.delete(`profile-${profileId}`);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Update current user's own profile
   */
  async updateOwnProfile(data: Partial<Profile>): Promise<Profile> {
    if (!this.currentUser) {
      throw new Error("No authenticated user");
    }
    
    return this.updateProfile(this.currentUser.id, data);
  }

  /**
   * Search for profiles
   */
  async searchProfiles(query: string): Promise<Profile[]> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(
          `Failed to search profiles: ${response.statusText} (${response.status})`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error searching profiles:", error);
      throw error;
    }
  }

  /**
   * Upload a profile avatar
   */
  async uploadAvatar(profileId: string | number, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${profileId}/avatar`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(
          `Failed to upload avatar: ${response.statusText} (${response.status})`
        );
      }
      
      // Invalidate cache
      if (this.enableCaching) {
        this.cache.delete(`profile-${profileId}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  /**
   * Link a Goated account to the profile
   */
  async linkGoatedAccount(profileId: string | number, goatedId: string): Promise<Profile> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${profileId}/link-goated`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goatedId }),
      });
      
      if (!response.ok) {
        throw new Error(
          `Failed to link Goated account: ${response.statusText} (${response.status})`
        );
      }
      
      const updatedProfile = await response.json();
      
      // Invalidate cache
      if (this.enableCaching) {
        this.cache.delete(`profile-${profileId}`);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error("Error linking Goated account:", error);
      throw error;
    }
  }

  /**
   * Get the basic stats of a profile
   */
  async getProfileStats(profileId: string | number): Promise<Profile['stats']> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${profileId}/stats`);
      
      if (!response.ok) {
        throw new Error(
          `Failed to fetch profile stats: ${response.statusText} (${response.status})`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      throw error;
    }
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