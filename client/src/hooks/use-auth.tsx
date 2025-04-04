
import React, { createContext, useContext, useEffect, useState } from "react";
import type { SelectUser } from "@db/schema";
import { 
  checkAuthStatus, 
  login as loginService, 
  register as registerService, 
  logout as logoutService,
  LoginCredentials,
  RegisterCredentials,
  isAdminUser
} from "@/services/authService";

/**
 * Authentication Context Type
 * 
 * Defines the shape of our authentication context that will be
 * provided throughout the application
 */
interface AuthContextType {
  user: SelectUser | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;  // Token refresh function
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Provides authentication state and methods to the entire application.
 * Manages user authentication state and exposes auth-related functions.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Core state management for auth
  const [user, setUser] = useState<SelectUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Effect to check authentication status on mount
   * Fetches user data if a valid session exists
   */
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await checkAuthStatus();
        setUser(userData);
      } catch (err) {
        console.error("Auth verification failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  /**
   * Handle user login
   * 
   * @param username Username credential
   * @param password Password credential
   */
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await loginService({ username, password });
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user registration
   * 
   * @param username Username for new account
   * @param email Email for new account
   * @param password Password for new account
   */
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await registerService({ username, email, password });
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user logout
   * Clears user data and authenticated state
   */
  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    }
  };

/**
 * Attempt to refresh the authentication token
 * Will be fully implemented in Phase 2
 * 
 * @returns Promise resolving to whether refresh was successful
 */
const refreshToken = async (): Promise<boolean> => {
  // This is a placeholder for Phase 2 implementation
  // TODO: Replit Phase 2 - Implement token refresh
  console.log("Token refresh requested - will be implemented in Phase 2");
  return false;
};

/**
 * Provide authentication context to children
 * Makes auth state and functions available throughout the app
 */
return (
  <AuthContext.Provider value={{ 
    user, 
    loading, 
    error, 
    login, 
    register, 
    logout,
    refreshToken, // Add the token refresh function
    isAuthenticated: !!user, // Derived property based on user existence
    isAdmin: isAdminUser(user) // Using the utility function from authService
  }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
