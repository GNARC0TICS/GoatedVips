import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import {
  ArrowRight,
  Trophy,
  CircleDot,
  Shield,
  Coins,
  Gift,
  Zap,
  MessageSquare,
  Lock,
} from "lucide-react";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { MVPCards } from "@/components/MVPCards";
import { RaceTimer } from "@/components/RaceTimer";
import { BonusCodeHeroCard } from "@/components/BonusCodeHeroCard";
//import { HeroCards } from "@/components/HeroCards"; //Removed as per instructions
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { TelegramStats } from "@/components/TelegramStats";

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-[#14151A]">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-24 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="mx-auto h-64 md:h-80 w-auto object-contain"
            >
              <source src="/images/FINAL.mp4" type="video/mp4" />
            </video>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <a 
              href="https://www.Goated.com/r/VIPBOOST" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-[#D7FF00]/10 border border-[#D7FF00] rounded-lg p-4 mx-auto max-w-md backdrop-blur-sm relative transition-all duration-300 hover:bg-[#D7FF00]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-[#D7FF00] animate-pulse" />
                    <span className="text-white font-heading">
                      NEW USER PROMO:
                    </span>
                  </div>
                  <div className="bg-[#D7FF00] px-3 py-1 rounded font-mono text-black font-bold tracking-wider">
                    VIPBOOST
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 text-[#D7FF00] text-sm text-center transition-all duration-300 bg-[#1A1B21] p-2 rounded-lg">
                  Use code VIPBOOST when signing up to instantly join our VIP program
                </div>
              </div>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-7xl mx-auto mb-16"
          ></motion.div>

          <div className="max-w-4xl mx-auto mb-12">
            <FeatureCarousel />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#8A8B91] max-w-2xl mx-auto mb-12"
          >
            Join an elite community of players at Goated.com, where your
            wagering transforms into rewards. Compete in exclusive wager races,
            claim daily bonus codes, and earn monthly payouts in our
            player-first ecosystem. From live streams to exclusive insights,
            become part of a thriving community where winning strategies are
            shared daily.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-24"
          >
            <h2 className="text-4xl font-heading text-white mb-12 text-center flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-[#D7FF00] animate-wiggle" />
              TOP PERFORMERS
            </h2>
            <MVPCards />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-24"
          >
            <h2 className="text-4xl font-heading text-white mb-12 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-[#D7FF00] animate-flicker" />
              EXPLORE OUR FEATURES
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 mb-12 max-w-7xl mx-auto px-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                  <Gift className="h-8 w-8 text-[#D7FF00] mb-4" />
                  <h3 className="text-2xl font-heading uppercase mb-4 text-white text-center flex items-center gap-2 justify-center">
                    Bonus Codes
                    {!isAuthenticated && <Lock className="h-4 w-4 text-[#8A8B91]" />}
                  </h3>
                  <p className="text-[#8A8B91] mb-6 font-body">
                    {isAuthenticated 
                      ? "Exclusive bonus codes updated regularly. Claim special rewards and boost your gaming experience."
                      : "Sign in to access exclusive bonus codes and rewards"}
                  </p>
                  {isAuthenticated ? (
                    <Link href="/bonus-codes">
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                        View Codes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <span className="font-heading text-[#8A8B91] inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
                            <Lock className="h-4 w-4" />
                            Locked
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sign in to access bonus codes and rewards</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <Link href="/vip-transfer" className="block h-full">
                  <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                    <Trophy className="h-8 w-8 text-[#D7FF00] mb-4" />
                    <h3 className="text-2xl font-heading uppercase mb-4 text-white">
                      VIP Transfer
                    </h3>
                    <p className="text-[#8A8B91] mb-6 font-body">
                      Transfer your VIP status from other platforms and get cash bonuses.
                    </p>
                    <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                      Find out more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <Link href="/wager-races" className="block h-full">
                  <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <h3 className="text-2xl font-heading uppercase text-white">
                        Wager Races
                      </h3>
                      <div className="flex items-center gap-1">
                        <CircleDot className="h-3 w-3 text-red-500 animate-pulse" />
                        <span className="text-xs text-[#8A8B91]">LIVE</span>
                      </div>
                    </div>
                    <p className="text-[#8A8B91] mb-6 font-body">
                      Compete in exclusive wager races for massive prize pools and rewards.
                    </p>
                    <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                      How it works <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <Link href="/provably-fair" className="block h-full">
                  <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                    <Shield className="h-8 w-8 text-[#D7FF00] mb-4" />
                    <h3 className="text-2xl font-heading uppercase text-white mb-4">
                      Provably Fair
                    </h3>
                    <p className="text-[#8A8B91] mb-6 font-body">
                      Learn how our games ensure complete transparency and fairness
                    </p>
                    <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                      Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <Link href="/tips-and-strategies" className="block h-full">
                  <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                    <Zap className="h-8 w-8 text-[#D7FF00] mb-4" />
                    <h3 className="text-2xl font-heading uppercase text-white mb-4">
                      Tips & Strategies
                    </h3>
                    <p className="text-[#8A8B91] mb-6 font-body">
                      Discover winning strategies from our community experts
                    </p>
                    <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                      View Tips <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <a href="https://t.me/xGoombas" target="_blank" rel="noopener noreferrer" className="block h-full">
                  <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                    <div>
                      <MessageSquare className="h-8 w-8 text-[#D7FF00] mb-4" />
                      <h3 className="text-2xl font-heading uppercase text-white mb-4">
                        Telegram Community
                      </h3>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Join our active Telegram community for updates and support
                      </p>
                      <TelegramStats />
                    </div>
                    <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                      Join Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group h-full perspective-1000"
              >
                <Link href="/goated-token" className="block h-full">
                  <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" 
                    style={{ 
                      background: 'linear-gradient(to bottom, #D7FF0020, transparent)',
                    }}
                  />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg card-hover flex flex-col justify-between h-full"
                    style={{
                      '--hover-border-color': '#D7FF0080',
                      '--hover-shadow-color': '#D7FF0040'
                    } as React.CSSProperties}>
                    <Coins className="h-8 w-8 text-[#D7FF00] mb-4" />
                    <h3 className="text-2xl font-heading uppercase text-white mb-4">
                      $GOATED Airdrop
                    </h3>
                    <p className="text-[#8A8B91] mb-6 font-body">
                      Participate in our token airdrop and earn rewards
                    </p>
                    <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                      Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm p-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-heading text-white mb-8 text-center flex items-center justify-center gap-3">
                  <Trophy className="w-7 h-7 text-[#D7FF00]" />
                  DAILY LEADERBOARD
                </h2>
                <LeaderboardTable timePeriod="today" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-16"
            >
              <a 
                href="https://www.Goated.com/r/VIPBOOST" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-[#D7FF00] text-black font-heading text-xl px-8 py-4 rounded-lg hover:bg-[#D7FF00]/90 transition-all duration-300 transform hover:scale-105"
              >
                JOIN THE GOATS TODAY! 🐐
              </a>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <RaceTimer />
    </div>
  );
}

const styles = `
  @keyframes pulse {
    0% {
      opacity: 0;
      transform: translateY(-50%) scale(0.95);
    }
    50% {
      opacity: 0.5;
      transform: translateY(-50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-50%) scale(0.95);
    }
  }
`;

export { styles };