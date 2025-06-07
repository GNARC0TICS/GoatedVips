import React from "react";
import HeroVideo from "@/components/home/HeroVideo";
import PromoBanner from "@/components/home/PromoBanner";
import { FeatureCarousel } from "@/components/features/FeatureCarousel";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MVPCards from "@/components/mvp/MVPCards";
import FeatureCardGrid from "@/components/home/FeatureCardGrid";
import LeaderboardTable from "@/components/data/LeaderboardTable";
import CallToAction from "@/components/home/CallToAction";
import { useAuth } from "@/hooks/use-auth";

/**
 * Home Page
 * Modular landing system for GoatedVips.
 * Mobile-first responsive design with optimized touch targets and spacing.
 * DESIGN AGENT: All major sections are now modular. Polish each component as needed.
 */
export default function Home() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <div className="min-h-screen bg-[#14151A] w-full overflow-x-hidden">
      <main className="w-full">
        {/* Hero Section - Mobile-first with proper spacing */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-8 sm:pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-6 sm:space-y-8 lg:space-y-12">
              {/* Primary hero content */}
              <HeroVideo />
              
              {/* Promotional banner */}
              <PromoBanner />
              
              {/* Feature carousel with proper mobile spacing */}
              <div className="px-2 sm:px-4">
                <FeatureCarousel />
              </div>
              
              {/* Intro section with mobile-optimized typography */}
              <AnimatedSection>
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                  <p className="text-base sm:text-lg lg:text-xl text-[#8A8B91] leading-relaxed">
                    Join an elite community of players at Goated.com, where your wagering transforms into rewards. 
                    Compete in exclusive wager races, claim daily bonus codes, and earn monthly payouts in our 
                    player-first ecosystem. From live streams to exclusive insights, become part of a thriving 
                    community where winning strategies are shared daily.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Content sections with consistent spacing */}
        <div className="px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 lg:space-y-24 pb-12 sm:pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto">
            {/* MVP Cards Section */}
            <MVPCards />
            
            {/* Feature Grid Section */}
            <FeatureCardGrid />
            
            {/* Leaderboard Section with proper mobile layout */}
            <div className="w-full">
              <LeaderboardTable timePeriod="today" />
            </div>
            
            {/* Call to Action Section */}
            <CallToAction />
          </div>
        </div>
      </main>
    </div>
  );
}