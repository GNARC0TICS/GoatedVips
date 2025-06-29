import { z } from 'zod';

export const UserRole = z.enum(['user', 'admin', 'moderator']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['active', 'suspended', 'deleted']);
export type UserStatus = z.infer<typeof UserStatus>;

export const UserPrivacySettings = z.object({
  profilePublic: z.boolean().default(true),
  showStats: z.boolean().default(true),
  showRankings: z.boolean().default(true),
});
export type UserPrivacySettings = z.infer<typeof UserPrivacySettings>;

export const UserPreferences = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  theme: z.enum(['light', 'dark']).default('dark'),
  language: z.string().default('en'),
});
export type UserPreferences = z.infer<typeof UserPreferences>;

export const User = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  passwordHash: z.string(),
  role: UserRole.default('user'),
  status: UserStatus.default('active'),
  
  // Profile
  displayName: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  profileColor: z.string().default('#D7FF00'),
  
  // Goated Integration
  goatedId: z.string().optional(),
  goatedUsername: z.string().optional(),
  goatedLinked: z.boolean().default(false),
  goatedVerified: z.boolean().default(false),
  
  // Settings
  privacy: UserPrivacySettings.default({}),
  preferences: UserPreferences.default({}),
  
  // Verification
  emailVerified: z.boolean().default(false),
  emailVerificationToken: z.string().optional(),
  
  // Security
  twoFactorEnabled: z.boolean().default(false),
  twoFactorSecret: z.string().optional(),
  passwordResetToken: z.string().optional(),
  passwordResetExpires: z.date().optional(),
  lastPasswordChange: z.date().optional(),
  
  // Activity
  lastLoginAt: z.date().optional(),
  lastActiveAt: z.date().optional(),
  loginCount: z.number().default(0),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof User>;

export const CreateUserInput = User.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  lastActiveAt: true,
  loginCount: true,
});

export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const UpdateUserInput = User.partial().omit({
  id: true,
  createdAt: true,
  passwordHash: true,
});

export type UpdateUserInput = z.infer<typeof UpdateUserInput>;