
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch, Redirect } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import './index.css';

// We no longer need a separate admin entry point
// Just redirect users to the main app's admin section

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#12131A] text-white">
        <Switch>
          <Route path="/">
            <Redirect to="/admin/login" />
          </Route>
          <Route path="*">
            <Redirect to="/admin/login" />
          </Route>
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
