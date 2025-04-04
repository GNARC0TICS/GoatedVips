
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';
import { isAdminDomain } from '@/lib/domain-utils';
import { useEffect } from 'react';

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading, isAdmin } = useAuth();

  // Check if we're on the correct domain for admin routes
  useEffect(() => {
    const adminCheck = isAdminDomain();
    // If we're not on admin domain, redirect to the admin domain
    if (!adminCheck) {
      const adminUrl = `https://goombas.net${window.location.pathname}`;
      window.location.href = adminUrl;
    }
  }, []);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
