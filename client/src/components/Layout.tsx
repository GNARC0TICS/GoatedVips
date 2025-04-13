import React, { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SelectUser } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

// Component imports
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ParticleBackground } from "./ParticleBackground";
import { RaceTimer } from "./RaceTimer";
import { Toaster } from "./ui/toaster";
import { ScrollToTop } from "./ScrollToTop";
import { AuthSection } from "./AuthSection";

interface LayoutProps {
  children: React.ReactNode;
  hideAuthButton?: boolean;
}

export function Layout({ children, hideAuthButton }: LayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch current user data
  const { data: user } = useQuery<SelectUser>({ queryKey: ["/api/user"] });
  const isAuthenticated = !!user;

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      toast({
        title: "Success",
        description: "Logged out successfully"
      });

      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#14151A]">
      {/* Background elements */}
      <ParticleBackground />

      {/* Header - Main navigation with optimized mobile menu */}
      <Header 
        isAuthenticated={isAuthenticated} 
        user={user} 
        handleLogout={handleLogout} 
      />

      {/* Auth Section - Desktop Only */}
      {!hideAuthButton && <AuthSection isAuthenticated={isAuthenticated} />}

      {/* Main content area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global UI elements */}
      <RaceTimer />
      <ScrollToTop />
      <Toaster />

      {/* Footer with responsive grid */}
      <Footer />
    </div>
  );
}

export default Layout;