import React, { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SelectUser } from "@db/schema";

import { ParticleBackground } from "./ParticleBackground";
import { RaceTimer } from "./RaceTimer";
import { Toaster } from "./ui/toaster";
import { ScrollToTop } from "./ScrollToTop";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AuthSection } from "./AuthSection";
import { useToast } from "@/hooks/use-toast";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<SelectUser>({ queryKey: ["/api/user"] });
  const isAuthenticated = !!user;

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
      <ParticleBackground />
      
      <Header 
        isAuthenticated={isAuthenticated} 
        user={user} 
        handleLogout={handleLogout} 
      />
      
      {/* Auth Section - Desktop Only */}
      <AuthSection isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        {children}
      </main>
      
      <RaceTimer />
      <ScrollToTop />
      <Toaster />
      <Footer />
    </div>
  );
}

export default Layout;
