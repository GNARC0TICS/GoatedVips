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
  // baseUrl?: string; // Removed as we're not using an external API
  enableCaching?: boolean;
  cacheDuration?: number;
}

/**
 * Centralized service for handling profile-related operations
 * Provides methods for fetching, updating, and managing user profiles
 * Uses a local database instead of an external API.
 */
class ProfileService {
  // private baseUrl: string; // Removed as we're not using an external API
  private enableCaching: boolean;
  private cacheDuration: number;
  private cache: Map<string, { data: any, timestamp: number }>;
  private currentUser: User | null = null;

  constructor(options: ProfileServiceOptions = {}) {
    // this.baseUrl = options.baseUrl || '/api'; // Removed
    this.enableCaching = options.enableCaching ?? true;
    this.cacheDuration = options.cacheDuration || 60000; // 1 minute in ms
    this.cache = new Map();
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  isProfileOwner(profileId: string | number): boolean {
    if (!this.currentUser) return false;

    const idMatch = this.currentUser.id.toString() === profileId.toString();
    let goatedIdMatch = false;
    if (typeof this.currentUser.goatedId === 'string') {
      goatedIdMatch = this.currentUser.goatedId === profileId.toString();
    }

    return idMatch || goatedIdMatch;
  }

  async getProfile(profileId: string | number): Promise<Profile> {
    const cacheKey = `profile-${profileId}`;

    if (this.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      // Replace with database interaction
      const data = await this.getProfileFromDatabase(profileId);
      if (this.enableCaching) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  async getOwnProfile(): Promise<Profile> {
    if (!this.currentUser) {
      throw new Error("No authenticated user");
    }

    return this.getProfile(this.currentUser.id);
  }

  async updateProfile(profileId: string | number, data: Partial<Profile>): Promise<Profile> {
    try {
      // Replace with database interaction
      const updatedProfile = await this.updateProfileInDatabase(profileId, data);
      if (this.enableCaching) {
        this.cache.delete(`profile-${profileId}`);
      }
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async updateOwnProfile(data: Partial<Profile>): Promise<Profile> {
    if (!this.currentUser) {
      throw new Error("No authenticated user");
    }

    return this.updateProfile(this.currentUser.id, data);
  }

  // searchProfiles removed as it uses external API

  async uploadAvatar(profileId: string | number, file: File): Promise<{ avatarUrl: string }> {
    try {
      // Replace with database interaction
      const avatarUrl = await this.uploadAvatarToDatabase(profileId, file);
      if (this.enableCaching) {
        this.cache.delete(`profile-${profileId}`);
      }
      return { avatarUrl };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  async linkGoatedAccount(profileId: string | number, goatedId: string): Promise<Profile> {
    try {
      // Replace with database interaction
      const updatedProfile = await this.linkGoatedAccountInDatabase(profileId, goatedId);
      if (this.enableCaching) {
        this.cache.delete(`profile-${profileId}`);
      }
      return updatedProfile;
    } catch (error) {
      console.error("Error linking Goated account:", error);
      throw error;
    }
  }

  async getProfileStats(profileId: string | number): Promise<Profile['stats']> {
    try {
      // Replace with database interaction
      const stats = await this.getProfileStatsFromDatabase(profileId);
      return stats;
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      throw error;
    }
  }

  clearCache(profileId?: string | number) {
    if (profileId) {
      this.cache.delete(`profile-${profileId}`);
    } else {
      this.cache.clear();
    }
  }

  // Placeholder functions for database interaction
  private async getProfileFromDatabase(profileId: string | number): Promise<Profile> {
    // Replace with your actual database query
    throw new Error("Not implemented");
  }

  private async updateProfileInDatabase(profileId: string | number, data: Partial<Profile>): Promise<Profile> {
    // Replace with your actual database update
    throw new Error("Not implemented");
  }

  private async uploadAvatarToDatabase(profileId: string | number, file: File): Promise<string> {
    // Replace with your actual database avatar upload
    throw new Error("Not implemented");
  }

  private async linkGoatedAccountInDatabase(profileId: string | number, goatedId: string): Promise<Profile> {
    // Replace with your actual database Goated account linking
    throw new Error("Not implemented");
  }

  private async getProfileStatsFromDatabase(profileId: string | number): Promise<Profile['stats']> {
    // Replace with your actual database stats query
    throw new Error("Not implemented");
  }
}

export const profileService = new ProfileService();

export default profileService;