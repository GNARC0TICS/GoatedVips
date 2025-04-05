
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';
import { useEffect } from 'react';

/**
 * AdminRoute Component
 * 
 * A specialized protected route component that:
 * 1. Enforces admin privileges
 * 2. Only renders admin components for users with admin access
 * 
 * This adds an additional layer of protection beyond the ProtectedRoute
 * component by checking for admin privileges.
 * 
 * Updated to work with the unified interface, no longer needs domain-specific checks
 * 
 * @param path The route path to protect
 * @param component The component to render if authenticated and admin
 */
export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
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

  // Redirect to home if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/auth?redirect=/admin" />
      </Route>
    );
  }

  // Render the admin component if authenticated and admin
  return <Route path={path} component={Component} />;
}
