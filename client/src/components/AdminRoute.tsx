
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';
import { isAdminDomain } from '@/lib/domain-utils';
import { useEffect } from 'react';

/**
 * AdminRoute Component
 * 
 * A specialized protected route component that:
 * 1. Enforces admin privileges
 * 2. Ensures the request is on the correct admin domain
 * 3. Redirects to the admin domain if accessed from public domain
 * 
 * This adds an additional layer of protection beyond the ProtectedRoute
 * component by checking for admin privileges.
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

  // Check if we're on the correct domain for admin routes
  useEffect(() => {
    const adminCheck = isAdminDomain();
    // If we're not on admin domain, redirect to the admin domain
    if (!adminCheck) {
      const adminUrl = `https://goombas.net${window.location.pathname}`;
      window.location.href = adminUrl;
    }
  }, []);

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
        <Redirect to="/" />
      </Route>
    );
  }

  // Render the admin component if authenticated and admin
  return <Route path={path} component={Component} />;
}
