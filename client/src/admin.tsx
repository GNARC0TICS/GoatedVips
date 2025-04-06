
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import GoombasAdminLogin from '@/pages/GoombasAdminLogin';
import GoombasAdminDashboard from '@/pages/GoombasAdminDashboard';
import { AdminRoute } from '@/components/AdminRoute';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#12131A] text-white">
        <Switch>
          <Route path="/" component={GoombasAdminLogin} />
          <AdminRoute path="/dashboard" component={GoombasAdminDashboard} />
          {/* Add other admin routes here */}
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
