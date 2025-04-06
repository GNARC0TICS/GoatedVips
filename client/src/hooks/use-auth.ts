import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  goatedId?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  createdAt?: string;
  totalWager?: number;
  verified?: boolean;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<User>;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  
  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    children
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Custom hook for authentication state management
 * Provides user data and authentication status
 * 
 * @returns Authentication state and utility functions
 */
function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/me");
        
        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated, this is a normal state
            setUser(null);
            return;
          }
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching current user:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCurrentUser();
  }, []);
  
  async function login(username: string, password: string) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }
  
  async function logout() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error during logout:", err);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function register(userData: { username: string; email: string; password: string }) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      
      const user = await response.json();
      setUser(user);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
  };
}