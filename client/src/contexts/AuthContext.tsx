import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import supabase from '../lib/supabase';

// Define the shape of our authentication context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  isAdmin: false,
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get session from Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Check if user is an admin
        if (initialSession?.user) {
          const isUserAdmin = initialSession.user.app_metadata?.role === 'admin';
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check if user is an admin
        if (currentSession?.user) {
          const isUserAdmin = currentSession.user.app_metadata?.role === 'admin';
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, data: null };
      }

      return { error: null, data: data.session };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Additional user metadata
        },
      });

      if (error) {
        return { error, data: null };
      }

      return { error: null, data: data.session };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Value provided to consuming components
  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;