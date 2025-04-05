/**
 * Authentication Service
 * 
 * A centralized service for authentication-related operations.
 * This service:
 * 1. Encapsulates API calls to auth endpoints
 * 2. Handles token management
 * 3. Provides utility functions for checking auth state
 * 4. Manages auth-related errors
 * 
 * Using this service instead of scattered logic helps maintain consistent
 * authentication behavior throughout the application.
 */

import type { SelectUser } from "@db/schema";
import { queryClient } from "@/lib/queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

/**
 * Checks the current authentication status by fetching user data
 * 
 * @returns User data if authenticated, null otherwise
 */
export async function checkAuthStatus(): Promise<SelectUser | null> {
  try {
    const response = await fetch("/api/user", {
      credentials: "include"
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.error("Auth check failed:", err);
    return null;
  }
}

/**
 * Attempts to login a user with the provided credentials
 * 
 * @param credentials Login credentials (username, password)
 * @returns User data on successful login
 * @throws Error on login failure
 */
export async function login(credentials: LoginCredentials): Promise<SelectUser> {
  const response = await fetch("/api/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(errorData.message || "Login failed");
  }

  const userData = await response.json();
  // Invalidate any cached user queries
  queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  return userData;
}

/**
 * Registers a new user with the provided details
 * 
 * @param credentials Registration details (username, email, password)
 * @returns User data on successful registration
 * @throws Error on registration failure
 */
export async function register(credentials: RegisterCredentials): Promise<SelectUser> {
  const response = await fetch("/api/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(errorData.message || "Registration failed");
  }

  const userData = await response.json();
  // Invalidate any cached user queries
  queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  return userData;
}

/**
 * Logs out the current user
 * 
 * @returns Promise resolving on successful logout
 * @throws Error on logout failure
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include"
    });
    // Clear all queries from cache on logout
    queryClient.clear();
  } catch (err) {
    console.error("Logout failed:", err);
    throw err;
  }
}

/**
 * Verifies if a route requires authentication
 * 
 * @param path Route path to check
 * @returns true if authentication is required, false otherwise
 */
export function requiresAuthentication(path: string): boolean {
  const PROTECTED_ROUTES = [
    '/bonus-codes',
    '/notification-preferences',
    '/admin/',
    '/profile/settings',
  ];
  
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Checks if the current user has admin privileges
 * 
 * @param user User object to check
 * @returns true if user is an admin, false otherwise
 */
export function isAdminUser(user: SelectUser | null): boolean {
  return !!user?.isAdmin;
}
