import { User, CreateUserInput, UpdateUserInput } from '../entities/User';

export interface IUserRepository {
  // Basic CRUD
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  
  // Goated Integration
  findByGoatedId(goatedId: string): Promise<User | null>;
  linkGoatedAccount(userId: string, goatedId: string, goatedUsername: string): Promise<User | null>;
  unlinkGoatedAccount(userId: string): Promise<User | null>;
  
  // Search and Lists
  search(query: string, limit?: number, offset?: number): Promise<{
    users: User[];
    total: number;
  }>;
  
  list(filters?: {
    role?: string;
    status?: string;
    verified?: boolean;
    goatedLinked?: boolean;
  }, pagination?: {
    limit: number;
    offset: number;
  }): Promise<{
    users: User[];
    total: number;
  }>;
  
  // Authentication helpers
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  
  // Activity tracking
  updateLastActivity(userId: string): Promise<void>;
  incrementLoginCount(userId: string): Promise<void>;
  
  // Admin functions
  getStats(): Promise<{
    total: number;
    verified: number;
    goatedLinked: number;
    activeToday: number;
    activeThisWeek: number;
  }>;
}