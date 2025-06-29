import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User, CreateUserInput, UpdateUserInput } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';
import { ICacheService } from '../../infrastructure/cache/ICacheService';
import { IEmailService } from '../../infrastructure/email/IEmailService';

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService,
    private emailService: IEmailService
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    const validatedInput = CreateUserInput.parse(input);
    
    // Check if user already exists
    const existingEmail = await this.userRepository.findByEmail(validatedInput.email);
    if (existingEmail) {
      throw new Error('User with this email already exists');
    }
    
    const existingUsername = await this.userRepository.findByUsername(validatedInput.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedInput.passwordHash, 12);
    
    // Generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user
    const userData = {
      ...validatedInput,
      passwordHash,
      emailVerificationToken,
    };
    
    const user = await this.userRepository.create(userData);
    
    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);
    
    // Cache user
    await this.cacheService.set(`user:${user.id}`, user, 3600); // 1 hour
    
    return user;
  }

  async findById(id: string): Promise<User | null> {
    // Try cache first
    const cached = await this.cacheService.get<User>(`user:${id}`);
    if (cached) return cached;
    
    // Fallback to database
    const user = await this.userRepository.findById(id);
    if (user) {
      await this.cacheService.set(`user:${id}`, user, 3600);
    }
    
    return user;
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;
    
    // Update login tracking
    await this.userRepository.updateLastActivity(user.id);
    await this.userRepository.incrementLoginCount(user.id);
    
    // Update cache
    await this.cacheService.set(`user:${user.id}`, user, 3600);
    
    return user;
  }

  async verifyEmail(token: string): Promise<User | null> {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) return null;
    
    const updatedUser = await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
    });
    
    if (updatedUser) {
      await this.cacheService.delete(`user:${user.id}`);
    }
    
    return updatedUser;
  }

  async linkGoatedAccount(userId: string, goatedId: string, goatedUsername: string): Promise<User | null> {
    // Check if Goated ID is already linked
    const existingLink = await this.userRepository.findByGoatedId(goatedId);
    if (existingLink && existingLink.id !== userId) {
      throw new Error('This Goated account is already linked to another user');
    }
    
    const user = await this.userRepository.linkGoatedAccount(userId, goatedId, goatedUsername);
    
    if (user) {
      await this.cacheService.delete(`user:${userId}`);
    }
    
    return user;
  }

  async updateProfile(userId: string, input: UpdateUserInput): Promise<User | null> {
    const validatedInput = UpdateUserInput.parse(input);
    
    const user = await this.userRepository.update(userId, validatedInput);
    
    if (user) {
      await this.cacheService.delete(`user:${userId}`);
    }
    
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;
    
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) return false;
    
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    const updated = await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
      lastPasswordChange: new Date(),
    });
    
    if (updated) {
      await this.cacheService.delete(`user:${userId}`);
    }
    
    return !!updated;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return false; // Don't reveal if email exists
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });
    
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findByPasswordResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return false;
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    const updated = await this.userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      lastPasswordChange: new Date(),
    });
    
    if (updated) {
      await this.cacheService.delete(`user:${user.id}`);
    }
    
    return !!updated;
  }

  async search(query: string, limit = 20, offset = 0) {
    return this.userRepository.search(query, limit, offset);
  }

  async getStats() {
    const cacheKey = 'user:stats';
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;
    
    const stats = await this.userRepository.getStats();
    await this.cacheService.set(cacheKey, stats, 300); // 5 minutes
    
    return stats;
  }
}