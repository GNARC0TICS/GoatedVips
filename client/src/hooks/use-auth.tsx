import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService, UserProfile } from "@/services/profileService";
import { z } from "zod";

/**
 * Auth-related types
 */
export type User = UserProfile;

export const LoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
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
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
        });

        if (!response.ok) {
          // Not authenticated is a normal state, not an error
          if (response.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        return userData as User;
      } catch (err) {
        console.error("Error fetching user:", err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update profile service with current user
  useEffect(() => {
    profileService.setCurrentUser(user);
  }, [user]);

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

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Login failed",
        }));
        throw new Error(errorData.message || "Login failed");
      }

      const userData = await response.json();
      return userData;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/user"], userData);
      profileService.setCurrentUser(userData);
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

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Registration failed",
        }));
        throw new Error(errorData.message || "Registration failed");
      }

      const newUser = await response.json();
      return newUser;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/user"], userData);
      profileService.setCurrentUser(userData);
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

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Logout failed",
        }));
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      profileService.setCurrentUser(null);
      profileService.clearCache(); // Clear profile cache on logout
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