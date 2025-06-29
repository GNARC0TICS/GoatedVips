import { LeaderboardTable } from "@/components/data/LeaderboardTable";
import { motion } from "framer-motion";
import { Crown, Zap, Trophy } from "lucide-react";
import {
  ArrowRight,
  CircleDot,
  Shield,
  Coins,
  Gift,
  Lock,
  Repeat,
  Search,
} from "lucide-react";
import { MVPCards } from "@/components/mvp/MVPCards";
import { RaceTimer } from "@/components/data/RaceTimer";
import { BonusCodeHeroCard } from "@/components/features/BonusCodeHeroCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { UserSearch } from "@/components/interactive/UserSearch";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureCardGrid } from "@/components/home/FeatureCardGrid";
import { CallToAction } from "@/components/home/CallToAction";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageTransition } from "@/components/effects";

import React from "react";
import { LazyLoad } from "@/components/utils/LazyLoad";

export default function Home() {
  return (
    <PageTransition>
    <div className="min-h-screen bg-[#14151A]">
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
        <div className="text-center mb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HeroVideo streams in when it first enters the viewport */}
          <LazyLoad importer={() => import("@/components/home/HeroVideo")} />
          <PromoBanner />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-7xl mx-auto mb-20"
          >
            <div className="max-w-4xl mx-auto mb-12">
              {/* FeatureCarousel is heavy: defer importing until visible */}
              <LazyLoad importer={() => import("@/components/features/FeatureCarousel")} />
            </div>

            <AnimatedSection 
              preset="fadeInUp" 
              delay={0.1}
              elementType="p"
              className="text-lg leading-relaxed text-[#8A8B91] max-w-3xl mx-auto mb-12 px-4"
            >
              Join an elite community of players at Goated.com, where your
              wagering transforms into rewards. Compete in exclusive wager races,
              claim daily bonus codes, and earn monthly payouts in our
              player-first ecosystem. From live streams to exclusive insights,
              become part of a thriving community where winning strategies are
              shared daily.
            </AnimatedSection>

            <AnimatedSection 
              preset="fadeInUp" 
              delay={0.2}
              className="mb-16 sm:mb-20 lg:mb-24"
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-white mb-8 sm:mb-10 lg:mb-12 text-center flex items-center justify-center gap-2 sm:gap-3">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#D7FF00] animate-wiggle" />
                TOP PERFORMERS
              </h2>
              <MVPCards />
            </AnimatedSection>

            <AnimatedSection 
              preset="fadeInUp" 
              delay={0.3}
              className="mb-16 sm:mb-20 lg:mb-24"
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-white mb-8 sm:mb-10 lg:mb-12 text-center flex items-center justify-center gap-2 sm:gap-3">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#D7FF00] animate-flicker" />
                EXPLORE OUR FEATURES
              </h2>
              <FeatureCardGrid />
            </AnimatedSection>

            <AnimatedSection 
              preset="fadeIn"
              delay={0.4}
              className="mb-16"
              whileInView={{
                opacity: 1,
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm p-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-heading text-white mb-8 text-center flex items-center justify-center gap-3">
                  <Trophy className="w-7 h-7 text-[#D7FF00]" />
                  DAILY LEADERBOARD
                </h2>
                <LeaderboardTable timePeriod="today" />
              </div>
            </AnimatedSection>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 }}
            >
              <CallToAction />
            </motion.div>
            
          </motion.div>
        </div>
      </main>
      {/* RaceTimer moved to Layout component for app-wide availability */}
    </div>
    </PageTransition>
  );
}
