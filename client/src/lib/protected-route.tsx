
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Shield } from 'lucide-react';
import { Redirect, Route } from 'wouter';
import { requiresAuthentication } from '@/services/authService';
import { Button } from '@/components/ui/button';

/**
 * Re-export requiresAuthentication from authService
 * This maintains backwards compatibility while centralizing the logic
 */
export const requiresAuth = requiresAuthentication;

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** The route path to protect */
  path: string;
  /** The component to render if authenticated */
  component: React.ComponentType<any>;
  /** Optional admin-only access requirement */
  adminOnly?: boolean;
  /** Optional redirect path for unauthenticated users (defaults to /auth) */
  redirectTo?: string;
}

/**
 * Enhanced Protected Route Component
 * 
 * A higher-order component that protects routes requiring authentication.
 * It handles four states:
 * 1. Loading: Shows a spinner while auth state is being determined
 * 2. Unauthenticated: Redirects to the auth page or custom redirect path
 * 3. Authenticated but missing admin rights (for adminOnly routes): Shows access denied
 * 4. Fully authenticated: Renders the protected component
 * 
 * @param props ProtectedRouteProps configuration object
 */
export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  redirectTo = "/auth"
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={{
          pathname: redirectTo,
          search: `?redirect=${encodeURIComponent(path)}`
        }} />
      </Route>
    );
  }

  // Handle admin-only routes
  if (adminOnly && !isAdmin) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-[#14151A] text-white">
          <Shield className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Route>
    );
  }

  // Render the protected component if authentication checks pass
  return <Route path={path} component={Component} />;
}
