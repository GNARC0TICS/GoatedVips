import { LeaderboardTable } from "@/components/data/LeaderboardTable";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Crown, Zap, Trophy, Star, Sparkles, Gamepad2 } from "lucide-react";
import { MVPCards } from "@/components/mvp/MVPCards";
import { useAuth } from "@/hooks/use-auth";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureCardGrid } from "@/components/home/FeatureCardGrid";
import { CallToAction } from "@/components/home/CallToAction";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageTransition } from "@/components/effects";

import React, { useRef, useMemo } from "react";
import { LazyLoad } from "@/components/utils/LazyLoad";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Enhanced scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const heroY = useTransform(smoothProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, -200]);
  
  // Memoized animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }), []);
  
  const sectionVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
      }
    }
  }), []);

  return (
    <PageTransition>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#14151A] via-[#1A1B21] to-[#0F1014] relative overflow-hidden">
        {/* Enhanced background effects */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{ y: backgroundY }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D7FF00]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00C9FF]/5 rounded-full blur-3xl" />
        </motion.div>
        
        <main className="relative z-10">
          <motion.div 
            className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Enhanced Hero Section */}
            <motion.section 
              className="text-center mb-16 sm:mb-20 lg:mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
              style={{ y: heroY, opacity: heroOpacity }}
            >
              {/* Enhanced Hero Content */}
              <motion.div
                variants={sectionVariants}
                className="mb-8 sm:mb-12"
              >
                <div className="relative">
                  {/* Floating decorative elements */}
                  <motion.div 
                    className="absolute -top-8 -left-8 opacity-20"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Star className="w-8 h-8 text-[#D7FF00]" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -top-4 -right-4 opacity-20"
                    animate={{ 
                      rotate: [360, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-[#00C9FF]" />
                  </motion.div>
                  
                  <LazyLoad importer={() => import("@/components/home/HeroVideo")} />
                </div>
              </motion.div>
              
              <motion.div variants={sectionVariants}>
                <PromoBanner />
              </motion.div>

              {/* Enhanced Feature Carousel Section */}
              <motion.div
                variants={sectionVariants}
                className="max-w-7xl mx-auto mb-16 sm:mb-20"
              >
                <motion.div 
                  className="max-w-5xl mx-auto mb-12 relative"
                  whileInView={{ scale: [0.95, 1] }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/5 to-[#00C9FF]/5 rounded-2xl blur-xl" />
                  <div className="relative bg-[#1A1B21]/50 backdrop-blur-sm rounded-2xl border border-[#2A2B31]/50 p-2">
                    <LazyLoad importer={() => import("@/components/features/FeatureCarousel")} />
                  </div>
                </motion.div>

                {/* Enhanced Description with Interactive Elements */}
                <motion.div
                  variants={sectionVariants}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/5 via-transparent to-[#00C9FF]/5 rounded-xl blur-sm" />
                  <div className="relative bg-[#1A1B21]/30 backdrop-blur-sm rounded-xl border border-[#2A2B31]/30 p-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center mb-6">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Gamepad2 className="w-8 h-8 text-[#D7FF00] mr-2" />
                      </motion.div>
                      <h3 className="text-xl font-heading text-white font-bold">
                        {isAuthenticated ? `Welcome back, ${user?.username}!` : "Welcome to the Elite"}
                      </h3>
                    </div>
                    
                    <p className="text-lg leading-relaxed text-[#B8B9C0] text-center max-w-3xl mx-auto">
                      Join an elite community of players at Goated.com, where your
                      wagering transforms into rewards. Compete in exclusive wager races,
                      claim daily bonus codes, and earn monthly payouts in our
                      player-first ecosystem. From live streams to exclusive insights,
                      become part of a thriving community where winning strategies are
                      shared daily.
                    </p>
                    
                    {/* Enhanced Stats Row */}
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {[
                        { label: "Active Players", value: "10K+", icon: Crown },
                        { label: "Daily Rewards", value: "$50K+", icon: Zap },
                        { label: "Total Prizes", value: "$2M+", icon: Trophy }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          className="text-center group"
                        >
                          <motion.div
                            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D7FF00]/10 border border-[#D7FF00]/20 mb-3 group-hover:bg-[#D7FF00]/20 transition-colors"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <stat.icon className="w-6 h-6 text-[#D7FF00]" />
                          </motion.div>
                          <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                          <div className="text-sm text-[#8A8B91]">{stat.label}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.section>

            {/* Enhanced Main Content Sections */}
            <div className="space-y-20 sm:space-y-24 lg:space-y-32">
              {/* Top Performers Section */}
              <motion.section
                variants={sectionVariants}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/5 via-transparent to-[#D7FF00]/5 rounded-2xl blur-xl" />
                <div className="relative">
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-heading text-white mb-12 sm:mb-16 text-center"
                    whileInView={{ 
                      backgroundPosition: ["0% 50%", "100% 50%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                      backgroundImage: "linear-gradient(90deg, #FFFFFF, #D7FF00, #FFFFFF)",
                      backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    <motion.span 
                      className="inline-flex items-center gap-3"
                      whileInView={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-[#D7FF00]" />
                      TOP PERFORMERS
                    </motion.span>
                  </motion.h2>
                  
                  <motion.div
                    whileInView={{ scale: [0.95, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <MVPCards />
                  </motion.div>
                </div>
              </motion.section>

              {/* Features Section */}
              <motion.section
                variants={sectionVariants}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-[#00C9FF]/5 via-transparent to-[#00C9FF]/5 rounded-2xl blur-xl" />
                <div className="relative">
                  <motion.h2 
                    className="text-3xl sm:text-4xl lg:text-5xl font-heading text-white mb-12 sm:mb-16 text-center"
                    whileInView={{ 
                      backgroundPosition: ["0% 50%", "100% 50%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                    style={{
                      backgroundImage: "linear-gradient(90deg, #FFFFFF, #00C9FF, #FFFFFF)",
                      backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    <motion.span 
                      className="inline-flex items-center gap-3"
                      whileInView={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-[#00C9FF]" />
                      EXPLORE FEATURES
                    </motion.span>
                  </motion.h2>
                  
                  <motion.div
                    whileInView={{ y: [20, 0], opacity: [0, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <FeatureCardGrid />
                  </motion.div>
                </div>
              </motion.section>

              {/* Enhanced Leaderboard Section */}
              <motion.section
                variants={sectionVariants}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/10 via-[#00C9FF]/5 to-[#D7FF00]/10 rounded-2xl blur-2xl" />
                <motion.div 
                  className="relative bg-gradient-to-br from-[#1A1B21]/80 to-[#15161C]/80 backdrop-blur-xl rounded-2xl border border-[#2A2B31]/50 p-8 sm:p-12 max-w-7xl mx-auto overflow-hidden"
                  whileInView={{ 
                    boxShadow: [
                      "0 0 0 rgba(215, 255, 0, 0)",
                      "0 0 40px rgba(215, 255, 0, 0.1)",
                      "0 0 0 rgba(215, 255, 0, 0)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.h2 
                    className="text-3xl sm:text-4xl font-heading text-white mb-10 text-center flex items-center justify-center gap-3"
                    whileInView={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Trophy className="w-8 h-8 text-[#D7FF00]" />
                    DAILY LEADERBOARD
                  </motion.h2>
                  
                  <motion.div
                    whileInView={{ scale: [0.98, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <LeaderboardTable timePeriod="today" />
                  </motion.div>
                </motion.div>
              </motion.section>
              
              {/* Enhanced Call to Action */}
              <motion.section
                variants={sectionVariants}
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="relative"
              >
                <CallToAction />
              </motion.section>
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}