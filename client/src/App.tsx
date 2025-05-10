import React, { Suspense } from "react";
// Imports necessary components for routing and state management
import { Switch, Route, useLocation } from "wouter";
// Imports for error handling and boundary
import { ErrorBoundary } from "react-error-boundary";
// Imports the authentication provider
import { AuthProvider } from "@/contexts/AuthContext";
// Imports a custom error fallback component
import { ErrorFallback } from "@/components/ErrorFallback";
// Imports the tooltip provider
import { TooltipProvider } from "@/components/ui/tooltip";
// Imports for animation
import { AnimatePresence, motion } from "framer-motion";
// Imports the toaster for notifications
import { Toaster } from "@/components/ui/toaster";
// Imports the main layout component
import { Layout } from "@/components/Layout";
// Imports a loading spinner component
import { LoadingSpinner } from "@/components/LoadingSpinner";
// Imports a protected route component
import { ProtectedRoute } from "@/lib/protected-route";
// Imports a preloader component
import { PreLoader } from "@/components/PreLoader";
// Imports the not found component
// import NotFound from "@/pages/not-found"; // Now imported via routeService
// Imports the home page component
// import Home from "@/pages/Home"; // Now imported via routeService
// ... other direct page imports will be removed as they come from routeService

import { AdminRoute } from "@/components/AdminRoute";
import {
  publicRoutes,
  protectedRoutes,
  adminRoutes,
  goombasAdminRoutes,
  cryptoSwapRoute,
  notFoundRoute,
} from "@/services/routeService"; // Import route configurations

// MainContent Component
// Handles the core application rendering logic including preloader and route management
function MainContent() {
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsInitialLoad(false);
    } else {
      const timeout = setTimeout(() => {
        sessionStorage.setItem('hasVisited', 'true');
        setIsInitialLoad(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AnimatePresence mode="wait">
        {isInitialLoad ? (
          // Show preloader on initial visit
          <PreLoader key="preloader" onLoadComplete={() => setIsInitialLoad(false)} />
        ) : (
          // Main application content with loading state
          <Suspense fallback={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-[#14151A] z-50"
            >
              <LoadingSpinner size="lg" />
            </motion.div>
          }>
            <TooltipProvider>
              <Layout>
                {/* Main routing configuration */}
                <Switch>
                  {/* Public Routes */}
                  {publicRoutes.map(({ path, component }) => (
                    <Route key={path} path={path} component={component} />
                  ))}

                  {/* Protected Routes - Require Authentication */}
                  {protectedRoutes.map(({ path, component }) => (
                    <ProtectedRoute key={path} path={path} component={component} />
                  ))}

                  {/* Admin Routes - Require Admin Privileges */}
                  {adminRoutes.map(({ path, component }) => (
                    <AdminRoute key={path} path={path} component={component} />
                  ))}
                  
                  {/* Custom Admin Routes for goombas.net */}
                  {goombasAdminRoutes.map(({ path, component }) => (
                    <Route key={path} path={path} component={component} />
                  ))}
                  
                  {/* Crypto Swap Feature */}
                  <Route path={cryptoSwapRoute.path} component={cryptoSwapRoute.component} />

                  {/* Fallback Route */}
                  <Route component={notFoundRoute.component} />
                </Switch>
              </Layout>
              <Toaster />
            </TooltipProvider>
          </Suspense>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}

// Main App Component
// Provides global providers and error boundaries for the application
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <TooltipProvider>
          <MainContent />
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}