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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";

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
          >
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
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto px-4"
              >
                <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
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
                          View Codes <ArrowRight className="h-4 w-4" />
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
                </div>
                <Link href="/vip-transfer" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <h3 className="text-2xl font-heading uppercase mb-4 text-white">
                        VIP Transfer
                      </h3>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Transfer your VIP status from other platforms and get cash
                        bonuses.
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                        Find out more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>

                <Link href="/wager-races" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <h3 className="text-2xl font-heading uppercase text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 15 15" className="text-[#D7FF00]">
                          <path fill="currentColor" d="M4.993 1.582a.5.5 0 1 0-.986-.164l-2 12a.5.5 0 1 0 .986.164l.67-4.02c.806.118 1.677.157 2.363.638a3.3 3.3 0 0 0 1.432.583c.966.146 1.83-.385 2.784-.234l1.289.194c.26.04.53-.16.569-.42l.884-5.934l.004-.004a.52.52 0 0 0-.427-.564l-1.289-.194c-.963-.143-1.829.373-2.783.23A2.8 2.8 0 0 1 7.3 3.38c-.739-.517-1.619-.603-2.486-.725zm-.59 3.538l.33-1.972c.599.082 1.233.129 1.788.369l-.295 1.965c-.57-.233-1.213-.278-1.822-.362m-.658 3.95l.33-1.974c.62.086 1.277.13 1.858.368l.3-1.976c.658.27 1.159.733 1.893.841l.3-1.98c.738.111 1.349-.177 2.058-.234l-.3 1.966c-.71.06-1.324.36-2.06.25l-.286 1.978c-.736-.11-1.238-.575-1.899-.844l-.3 1.976c-.595-.239-1.263-.281-1.894-.371m4.094-.76c.734.11 1.351-.192 2.061-.251l.284-1.978c.655-.06 1.325.111 1.968.209l-.28 1.976c-.644-.097-1.316-.269-1.971-.207l-.3 1.976c-.709.048-1.335.36-2.062.25z" />
                          </svg>
                          Wager Races
                        </h3>
                        <div className="flex items-center gap-1">
                          <CircleDot className="h-3 w-3 text-red-500 animate-pulse" />
                          <span className="text-xs text-[#8A8B91]">LIVE</span>
                        </div>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Compete in exclusive wager races for massive prize pools and
                        rewards.
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                        How it works <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>

                <Link href="/challenges" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <Trophy className="h-8 w-8 text-[#D7FF00] mb-4" />
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          Challenges
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          NEW
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Complete daily and weekly challenges to earn exclusive rewards and boost your earnings.
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                        View Challenges <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
                <Link href="/wheel-challenge" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" className="text-[#D7FF00] mb-4">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M45.5 24c0 11.874-9.626 21.5-21.5 21.5S2.5 35.874 2.5 24S12.126 2.5 24 2.5S45.5 12.126 45.5 24" strokeWidth="1" />
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M35.905 24c0 6.575-5.33 11.905-11.905 11.905S12.095 30.575 12.095 24S17.425 12.095 24 12.095S35.905 17.425 35.905 24" strokeWidth="1" />
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M28.16 28.686a6.17 6.17 0 0 1-4.081 1.538c-3.425 0-6.202-2.787-6.202-6.224s2.777-6.224 6.202-6.224a6.2 6.2 0 0 1 5.904 4.32" strokeWidth="1" />
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m26.377 21.802l3.757.305l.356-3.79m-.537 15.993l4.773 8.267M13.274 5.423l4.773 8.266m0 20.621l-4.773 8.267M34.747 5.386l-4.798 8.31M12.096 24H2.5m43 0h-9.596" strokeWidth="1" />
                      </svg>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          Wheel Spin
                        </h3>
                        {!isAuthenticated ? (
                          <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                            SIGN IN TO PLAY
                          </span>
                        ) : (
                          <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                            PLAY NOW
                          </span>
                        )}
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Spin the wheel daily for a chance to win exclusive bonus codes and rewards!
                        {!isAuthenticated && " Sign in to start winning daily prizes."}
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                        {isAuthenticated ? "Try Your Luck" : "Sign In to Play"} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid md:grid-cols-3 gap-6 mb-20"
              >
                <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                  <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 16 16" className="text-[#D7FF00] mb-4">
                        <path fill="currentColor" d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736q.058.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53l.529.531l-.001.002l-.002.002l-.006.006l-.006.005l-.01.01l-.045.04q-.317.265-.686.45C14.556 10.78 13.88 11 13 11a4.5 4.5 0 0 1-2.023-.454a3.5 3.5 0 0 1-.686-.45l-.045-.04l-.016-.015l-.006-.006l-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.25.25 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.25.25 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53l.529.531l-.001.002l-.002.002l-.006.006l-.016.015l-.045.04q-.317.265-.686.45C4.556 10.78 3.88 11 3 11a4.5 4.5 0 0 1-2.023-.454a3.5 3.5 0 0 1-.686-.45l-.045-.04l-.016-.015l-.006-.006l-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.25.25 0 0 0 .125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 0 1 1.5 0m2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z" />
                      </svg>
                    <h3 className="text-2xl font-heading uppercase mb-4 text-white">
                      Provably Fair
                    </h3>
                    <p className="text-[#8A8B91] mb-6 font-body">
                      All in-house games use a provably fair algorithm to ensure
                      complete transparency and fairness. Each game outcome can be
                      independently verified.
                    </p>
                    <Link href="/provably-fair">
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                        Learn More <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>


                <Link href="/goated-token" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <Coins className="h-8 w-8 text-[#D7FF00] mb-4" />
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          THE GOATED AIRDROP
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          COMING SOON
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Upcoming token launch with exclusive benefits for holders. Get
                        airdrops based on your wagered amount and unlock special
                        perks.
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                        Learn About Airdrops <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>

                <Link href="/promotions" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <Gift className="h-8 w-8 text-[#D7FF00] mb-4" />
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          PROMOTIONS
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          DAILY
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Discover daily promotions, bonuses, and special events. Take advantage
                        of exclusive offers and boost your gaming experience.
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                        View Promotions <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>

                <Link href="/telegram" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <MessageSquare className="h-8 w-8 text-[#D7FF00] mb-4" />
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          TELEGRAM GROUP                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          JOIN NOW
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body">
                        Join our Telegram community for exclusive updates, bonus codes,
                        and instant support. Stay connected with fellow players.
                      </p>
                      <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                        Join Community <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
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
          </motion.div>
        </div>
      </main>
      <RaceTimer />
    </div>
  );
}