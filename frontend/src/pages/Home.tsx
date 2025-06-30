import { LeaderboardTable } from "@/components/data/LeaderboardTable";
import { motion } from "framer-motion";
import { Crown, Zap, Trophy } from "lucide-react";
import { MVPCards } from "@/components/mvp/MVPCards";
import { useAuth } from "@/hooks/use-auth";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureCardGrid } from "@/components/home/FeatureCardGrid";
import { CallToAction } from "@/components/home/CallToAction";
import { PageTransition } from "@/components/effects";

import React from "react";
import { LazyLoad } from "@/components/utils/LazyLoad";

export default function Home() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#14151A]">
        <main>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Hero Section */}
            <section className="text-center mb-16 sm:mb-20 max-w-7xl mx-auto">
              {/* Hero Video */}
              <div className="mb-8 sm:mb-12">
                <LazyLoad importer={() => import("@/components/home/HeroVideo")} />
              </div>
              
              {/* Promo Banner */}
              <div className="mb-8">
                <PromoBanner />
              </div>

              {/* Feature Carousel Section */}
              <div className="max-w-5xl mx-auto mb-12">
                <LazyLoad importer={() => import("@/components/features/FeatureCarousel")} />
              </div>

              {/* Description */}
              <div className="bg-[#1A1B21] rounded-xl border border-[#2A2B31] p-8 max-w-4xl mx-auto">
                <h3 className="text-xl font-heading text-white font-bold mb-6 text-center">
                  {isAuthenticated ? `Welcome back, ${user?.username}!` : "Welcome to the Elite"}
                </h3>
                
                <p className="text-lg leading-relaxed text-[#B8B9C0] text-center max-w-3xl mx-auto">
                  Join an elite community of players at Goated.com, where your
                  wagering transforms into rewards. Compete in exclusive wager races,
                  claim daily bonus codes, and earn monthly payouts in our
                  player-first ecosystem. From live streams to exclusive insights,
                  become part of a thriving community where winning strategies are
                  shared daily.
                </p>
              </div>
            </section>

            {/* Main Content Sections */}
            <div className="space-y-16 sm:space-y-20">
              {/* Top Performers Section */}
              <section>
                <h2 className="text-3xl sm:text-4xl font-heading text-white mb-12 text-center flex items-center justify-center gap-3">
                  <Crown className="w-8 h-8 text-[#D7FF00]" />
                  TOP PERFORMERS
                </h2>
                <MVPCards />
              </section>

              {/* Features Section */}
              <section>
                <h2 className="text-3xl sm:text-4xl font-heading text-white mb-12 text-center flex items-center justify-center gap-3">
                  <Zap className="w-8 h-8 text-[#D7FF00]" />
                  EXPLORE FEATURES
                </h2>
                <FeatureCardGrid />
              </section>

              {/* Leaderboard Section */}
              <section>
                <div className="bg-[#1A1B21] rounded-2xl border border-[#2A2B31] p-8 sm:p-12 max-w-7xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-heading text-white mb-10 text-center flex items-center justify-center gap-3">
                    <Trophy className="w-8 h-8 text-[#D7FF00]" />
                    DAILY LEADERBOARD
                  </h2>
                  <LeaderboardTable timePeriod="today" />
                </div>
              </section>
              
              {/* Call to Action */}
              <section>
                <CallToAction />
              </section>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}