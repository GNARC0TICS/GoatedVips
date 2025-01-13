import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, CircleDot, Shield, Coins } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#14151A]">
      {/* Header */}
      <header className="border-b border-[#2A2B31] fixed top-0 w-full z-50 bg-[#14151A]/80 backdrop-blur-md">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Link href="/">
            <motion.img
              src="/images/logo-neon.png"
              alt="Goated"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-8 md:h-10 object-contain cursor-pointer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = "/images/fallback-logo.png"; // Fallback image
              }}
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button className="font-heading uppercase tracking-wider text-sm bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90">
                Play now →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/5 via-transparent to-transparent" />

        <main className="container relative mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-heading font-extrabold uppercase mb-6 bg-gradient-to-r from-[#D7FF00] via-[#D7FF00]/80 to-[#D7FF00]/60 bg-clip-text text-transparent"
            >
              Exclusive Rewards
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-[#8A8B91] font-sans max-w-2xl mx-auto"
            >
              Join Goated.com for unparalleled gaming, exclusive bonuses, and a top-tier VIP program.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-6"
          >
            {/* VIP Transfer */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-colors">
                <h3 className="text-2xl font-heading uppercase mb-4 text-white">VIP Transfer</h3>
                <p className="text-[#8A8B91] mb-6">Transfer your VIP status from other platforms and get cash bonuses.</p>
                <Link href="/vip-transfer">
                  <a className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                    Find out more <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
              </div>
            </div>

            {/* Wager Races */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-heading uppercase text-white">Wager Races</h3>
                  <div className="flex items-center gap-1">
                    <CircleDot className="h-3 w-3 text-red-500 animate-pulse" />
                    <span className="text-xs text-[#8A8B91]">LIVE</span>
                  </div>
                </div>
                <p className="text-[#8A8B91] mb-6">Compete in exclusive wager races for massive prize pools and rewards.</p>
                <Link href="/wager-races">
                  <a className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                    How it works <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
              </div>
            </div>

            {/* VIP Rewards */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-colors">
                <h3 className="text-2xl font-heading uppercase mb-4 text-white">VIP Rewards</h3>
                <p className="text-[#8A8B91] mb-6">Exclusive benefits like instant rakeback, level up bonuses, and monthly rewards.</p>
                <Link href="/vip-program">
                  <a className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                    Explore VIP Program <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Additional Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 mb-20"
          >
            {/* Provably Fair */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-colors">
                <Shield className="h-8 w-8 text-[#D7FF00] mb-4" />
                <h3 className="text-2xl font-heading uppercase mb-4 text-white">Provably Fair</h3>
                <p className="text-[#8A8B91] mb-6">
                  All in-house games use a provably fair algorithm to ensure complete transparency and fairness.
                  Each game outcome can be independently verified.
                </p>
                <Button variant="link" className="font-heading text-[#D7FF00] p-0 flex items-center gap-2 hover:text-[#D7FF00]/80">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* $GOAT Token */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-colors">
                <Coins className="h-8 w-8 text-[#D7FF00] mb-4" />
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-heading uppercase text-white">$GOAT Token</h3>
                  <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                    COMING SOON
                  </span>
                </div>
                <p className="text-[#8A8B91] mb-6">
                  Upcoming token launch with exclusive benefits for holders. Get airdrops based on your wagered amount
                  and unlock special perks.
                </p>
                <Button variant="link" className="font-heading text-[#D7FF00] p-0 flex items-center gap-2 hover:text-[#D7FF00]/80">
                  Learn About Airdrops <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm p-8">
              <LeaderboardTable />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}