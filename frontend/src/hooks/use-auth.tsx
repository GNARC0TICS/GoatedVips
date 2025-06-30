import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { z } from "zod";

/**
 * Auth-related types
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;

/**
 * Auth Context Type
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

/**
 * Create the Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  /**
   * Core query to fetch the current authenticated user
   */
  const {
    data: user,
    isLoading,
    error: userError,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          return response.data.user;
        }
        return null;
      } catch (err) {
        console.error("Error fetching user:", err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  // No profile service needed for v2.0

  // Set error from query
  useEffect(() => {
    if (userError) {
      setError(userError instanceof Error ? userError : new Error(String(userError)));
    }
  }, [userError]);

  /**
   * Login mutation
   */
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      setError(null);
      
      const response = await apiService.login(credentials.email, credentials.password);
      
      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }
      
      return response.data!.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["current-user"], userData);
    },
    onError: (err) => {
      setError(err);
      console.error("Login error:", err);
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      setError(null);
      
      const response = await apiService.register(userData.username, userData.email, userData.password);
      
      if (!response.success) {
        throw new Error(response.error || "Registration failed");
      }
      
      return response.data!.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["current-user"], userData);
    },
    onError: (err) => {
      setError(err);
      console.error("Registration error:", err);
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      setError(null);
      
      const response = await apiService.logout();
      
      if (!response.success) {
        throw new Error(response.error || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["current-user"], null);
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (err) => {
      setError(err);
      console.error("Logout error:", err);
    },
  });

  /**
   * Refreshes the current user data
   */
  const refreshUser = async (): Promise<User | null> => {
    try {
      const { data } = await refetch();
      return data || null;
    } catch (err) {
      console.error("Error refreshing user:", err);
      return null;
    }
  };

  /**
   * Auth context value
   */
  const authContextValue: AuthContextType = {
    user: (user === undefined ? null : user) as User | null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Higher-order component that requires authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const [_, navigate] = useLocation();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate("/login");
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// This is a placeholder. We'll need to import useLocation from wouter in the actual code
// since it's not directly available here
function useLocation(): [string, (to: string) => void] {
  return ["/", (to: string) => console.log(`Navigate to: ${to}`)];
}