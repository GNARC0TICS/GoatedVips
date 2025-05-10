import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import jwt_decode from 'jwt-decode'; // For decoding JWTs client-side

// Define the shape of our user object from the platform JWT
interface PlatformUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  // Add other relevant fields from JWT payload if needed
}

// Define the shape of our authentication context
type AuthContextType = {
  user: PlatformUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error?: string; user?: PlatformUser }>;
  signUp: (username: string, email: string, password: string) => Promise<{ error?: string; user?: PlatformUser }>;
  signOut: () => void;
  // Initial load check might still be useful
  initialAuthChecked: boolean; 
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ error: 'Not implemented' }),
  signUp: async () => ({ error: 'Not implemented' }),
  signOut: () => {},
  initialAuthChecked: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // For initial token load and user fetch
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  const fetchUserWithToken = useCallback(async (currentToken: string) => {
    if (!currentToken) return null;
    try {
      // Option 1: Decode JWT locally (if it contains all necessary user info)
      const decodedUser = jwt_decode<PlatformUser & { exp: number }>(currentToken);
      // Check expiry if decoding locally, though server will also check
      if (decodedUser.exp * 1000 < Date.now()) {
        localStorage.removeItem('authToken');
        return null;
      }
      // Option 2: Or, call an endpoint like /api/user to get user details
      // const response = await fetch('/api/user', {
      //   headers: { 'Authorization': `Bearer ${currentToken}` },
      // });
      // if (!response.ok) throw new Error('Failed to fetch user');
      // const data = await response.json();
      // return data.user;
      return { id: decodedUser.id, username: decodedUser.username, email: decodedUser.email, isAdmin: decodedUser.isAdmin };
    } catch (error) {
      console.error('Error fetching user or decoding token:', error);
      localStorage.removeItem('authToken'); // Clear invalid token
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const fetchedUser = await fetchUserWithToken(storedToken);
        if (fetchedUser) {
          setUser(fetchedUser);
          setToken(storedToken);
        }
      }
        setLoading(false);
      setInitialAuthChecked(true);
    };
    initializeAuth();
  }, [fetchUserWithToken]);

  const signIn = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername, password }), // Assuming login by email
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.message || 'Login failed' };
      }
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return { user: data.user };
    } catch (error: any) {
      setLoading(false);
      return { error: error.message || 'An unexpected error occurred' };
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.message || 'Sign up failed' };
      }
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return { user: data.user };
    } catch (error: any) {
      setLoading(false);
      return { error: error.message || 'An unexpected error occurred' };
    }
  };

  const signOut = () => {
      setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    // Optionally: call a /api/auth/logout endpoint if it exists and does server-side cleanup
  };

  const isAdmin = !!user?.isAdmin;

  const value = {
    user,
    token,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    initialAuthChecked,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;