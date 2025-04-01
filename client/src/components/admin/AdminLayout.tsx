import React, { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  BarChart3,
  Home,
  LogOut,
  Settings,
  Sliders,
  Users,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const fetchCurrentAdmin = async () => {
  const response = await fetch('/api/admin/me');
  if (!response.ok) {
    throw new Error('Not authorized');
  }
  return response.json();
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/me'],
    queryFn: fetchCurrentAdmin,
    retry: false,
  });
  
  // Check if the user is authenticated as an admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6">You need administrator privileges to access this area.</p>
        <Button asChild>
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  const navItems = [
    { path: '/admin', icon: <Home className="mr-2 h-4 w-4" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="mr-2 h-4 w-4" />, label: 'User Management' },
    { path: '/admin/wager-overrides', icon: <Sliders className="mr-2 h-4 w-4" />, label: 'Wager Overrides' },
    { path: '/admin/analytics', icon: <BarChart3 className="mr-2 h-4 w-4" />, label: 'Analytics' },
    { path: '/admin/settings', icon: <Settings className="mr-2 h-4 w-4" />, label: 'Settings' },
  ];
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-muted border-r border-border">
        <div className="p-6">
          <Link href="/admin">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="font-bold text-xl text-primary">Goated Admin</div>
            </div>
          </Link>
        </div>
        
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center px-4 py-2 rounded-md hover:bg-primary/10 transition-colors ${
                    location === item.path ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                  }`}>
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-4 py-4 mt-auto border-t border-border mt-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
              <span className="text-primary-foreground font-bold text-sm">
                {adminData?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="font-medium">{adminData?.username || 'Admin'}</div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full flex items-center" asChild>
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
}