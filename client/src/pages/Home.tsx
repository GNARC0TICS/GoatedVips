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
  Repeat,
} from "lucide-react";
import { CryptoSwapHomeWidget } from "@/components/CryptoSwapHomeWidget";
import { CryptoSwapTooltip } from "@/components/CryptoSwapTooltip";
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
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
    const { user } = useAuth();
    const isAuthenticated = !!user;
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
                    <div className="flex items-start mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48" className="text-[#D7FF00]">
                        <defs>
                          <mask id="ipTDatabaseCode0">
                            <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
                              <path d="M34 12v9a9.98 9.98 0 0 0-7.442 3.32A9.96 9.96 0 0 0 24 31q.002.87.144 1.698a10.01 10.01 0 0 0 4.93 7.007C26.412 40.51 22.878 41 19 41c-8.284 0-15-2.239-15-5V12" />
                              <path fill="#555555" d="M34 12c0 2.761-6.716 5-15 5S4 14.761 4 12s6.716-5 15-5s15 2.239 15 5" />
                              <path d="M4 28c0 2.761 6.716 5 15 5c1.807 0 3.54-.106 5.144-.302M4 20c0 2.761 6.716 5 15 5c2.756 0 5.339-.248 7.558-.68" />
                              <path fill="#555555" d="M44 31c0 5.523-4.477 10-10 10c-1.79 0-3.472-.47-4.926-1.295A10.01 10.01 0 0 1 24 31c0-2.568.968-4.91 2.558-6.68A9.98 9.98 0 0 1 34 21c5.523 0 10 4.477 10 10" />
                              <path d="m37 29l2 2l-2 2m-6 0l-2-2l2-2" />
                            </g>
                          </mask>
                        </defs>
                        <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTDatabaseCode0)" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <h3 className="text-2xl font-heading uppercase text-white">
                        Bonus Codes
                      </h3>
                      {!isAuthenticated && <Lock className="h-4 w-4 text-[#8A8B91]" />}
                    </div>
                    <p className="text-[#8A8B91] mb-6 font-body text-center">
                      {isAuthenticated 
                        ? "Exclusive bonus codes updated regularly. Claim special rewards and boost your gaming experience."
                        : "Sign in to access exclusive bonus codes and rewards"}
                    </p>
                    <div className="mt-auto">
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
                </div>
                <Link href="/vip-transfer" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="text-[#D7FF00]">
                          <path fill="currentColor" d="M8 3L1 9h2v6h4v-4h2v4h4V9h2zm3.5 6v4.5h-1v-4h-5v4h-1V8L8 5l3.5 3zM9 16v2h6v-2l3 3l-3 3v-2H9v2l-3-3zm14-7h-2v6h-6v-5h4l-5.46-4.89L16 3z" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          VIP Transfer
                        </h3>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Transfer your VIP status from other platforms and get cash
                        bonuses.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                          Find out more <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/wager-races" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 15 15" className="text-[#D7FF00]">
                          <path fill="currentColor" d="M4.993 1.582a.5.5 0 1 0-.986-.164l-2 12a.5.5 0 1 0 .986.164l.67-4.02c.806.118 1.677.157 2.363.638a3.3 3.3 0 0 0 1.432.583c.966.146 1.83-.385 2.784-.234l1.289.194c.26.04.53-.16.569-.42l.884-5.934l.004-.004a.52.52 0 0 0-.427-.564l-1.289-.194c-.963-.143-1.829.373-2.783.23A2.8 2.8 0 0 1 7.3 3.38c-.739-.517-1.619-.603-2.486-.725zm-.59 3.538l.33-1.972c.599.082 1.233.129 1.788.369l-.295 1.965c-.57-.233-1.213-.278-1.822-.362m-.658 3.95l.33-1.974c.62.086 1.277.13 1.858.368l.3-1.976c.658.27 1.159.733 1.893.841l.3-1.98c.738.111 1.349-.177 2.058-.234l-.3 1.966c-.71.06-1.324.36-2.06.25l-.286 1.978c-.736-.11-1.238-.575-1.899-.844l-.3 1.976c-.595-.239-1.263-.281-1.894-.371m4.094-.76c.734.11 1.351-.192 2.061-.251l.284-1.978c.655-.06 1.325.111 1.968.209l-.28 1.976c-.644-.097-1.316-.269-1.971-.207l-.3 1.976c-.709.048-1.335.36-2.062.25z" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          Wager Races
                        </h3>
                        <div className="flex items-center gap-1">
                          <CircleDot className="h-3 w-3 text-red-500 animate-pulse" />
                          <span className="text-xs text-[#8A8B91]">LIVE</span>
                        </div>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Compete in exclusive wager races for massive prize pools and
                        rewards.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                          How it works <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/challenges" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" className="text-[#D7FF00]">
                          <path fill="currentColor" d="M459.9 23.48C327 43.49 189.7 52.14 45.6 42.67C55.13 191.1 63.8 339.8 61.95 490.2c129.65-8.9 259.25-18 393.15-4.1c-5.7-154.5-13.9-309 4.8-462.62M251.1 81.39c46.4.22 93 19.81 126.7 57.71c61.6 69.1 57.7 178.5-9.6 238.4c-3.2 2.9-6.5 5.5-9.8 8.1c-14.6 26-14.2 57.1-39 61.7c-12.9 2.4-26-10.2-37.2-22.7c-4.8 8.6-9.7 14.6-15.8 14.4c-5.7-.2-9.1-10.1-11.4-21.5c-44.5-1.8-88.6-21.3-120.8-57.5c-61.61-69.1-57.77-178.5 9.6-238.5c30.5-27.15 68.8-40.3 107.3-40.11m4.3 36.31c-6.8.1-13.6.7-20.4 1.9c-1.8 9.6-4.3 18.5-9 18.7c-4.9.2-8.7-5.2-12.5-12.5c-13.6 5.2-26.5 13.1-38.3 23.6c-52.3 46.6-63.3 127.4-14.1 182.6c49.1 55.2 130.8 61.2 183.1 14.6c52.3-46.5 55.9-128.4 6.7-183.6c-26.9-30.2-61.2-45.3-95.5-45.3m8.5 44.2c17.9.2 35.3 6.1 49.3 18.4c34.3 30.3 33.8 88.2 3 123c-30.8 34.9-84.1 39.6-118.4 9.2c-34.3-30.3-36.2-83.8-5.3-118.6c18.3-20.7 45.3-32.3 71.4-32m-10.4 37.7c-14.1-.1-28.2 5.2-38 16.2c-18.5 20.9-12.9 52.8 6.2 69.7s53.5 14.8 72-6.1c18.4-20.8 12.4-50.8-6.7-67.7c-9-8-21.2-12.1-33.5-12.1m-2.6 33.6a21.02 19.18 0 0 1 21 19.2a21.02 19.18 0 0 1-21 19.2a21.02 19.18 0 0 1-21-19.2a21.02 19.18 0 0 1 21-19.2" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          Challenges
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          NEW
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Complete daily and weekly challenges to earn exclusive rewards and boost your earnings.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                          View Challenges <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/wheel-challenge" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48" className="text-[#D7FF00]">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M45.5 24c0 11.874-9.626 21.5-21.5 21.5S2.5 35.874 2.5 24S12.126 2.5 24 2.5S45.5 12.126 45.5 24" strokeWidth="1" />
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M35.905 24c0 6.575-5.33 11.905-11.905 11.905S12.095 30.575 12.095 24S17.425 12.095 24 12.095S35.905 17.425 35.905 24" strokeWidth="1" />
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M28.16 28.686a6.17 6.17 0 0 1-4.081 1.538c-3.425 0-6.202-2.787-6.202-6.224s2.777-6.224 6.202-6.224a6.2 6.2 0 0 1 5.904 4.32" strokeWidth="1" />
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m26.377 21.802l3.757.305l.356-3.79m-.537 15.993l4.773 8.267M13.274 5.423l4.773 8.266m0 20.621l-4.773 8.267M34.747 5.386l-4.798 8.31M12.096 24H2.5m43 0h-9.596" strokeWidth="1" />
                        </svg>
                      </div>
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
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Spin the wheel daily for a chance to win exclusive bonus codes and rewards!
                        {!isAuthenticated && " Sign in to start winning daily prizes."}
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                          {isAuthenticated ? "Try Your Luck" : "Sign In to Play"} <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
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
                    <div className="flex items-start mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="text-[#D7FF00]">
                        <path fill="currentColor" d="M12.75 2.75V4.5h1.975c.351 0 .694.106.984.303l1.697 1.154q.063.042.14.043h4.102a.75.75 0 0 1 0 1.5H20.07l3.366 7.68a.75.75 0 0 1-.23.896q-.15.111-.31.206a6 6 0 0 1-.79.399a7.35 7.35 0 0 1-2.856.569a7.3 7.3 0 0 1-2.855-.568a6 6 0 0 1-.79-.4a3 3 0 0 1-.307-.202l-.005-.004a.75.75 0 0 1-.23-.896l3.368-7.68h-.886c-.351 0-.694-.106-.984-.303l-1.697-1.154a.25.25 0 0 0-.14-.043H12.75v14.5h4.487a.75.75 0 0 1 0 1.5H6.763a.75.75 0 0 1 0-1.5h4.487V6H9.275a.25.25 0 0 0-.14.043L7.439 7.197c-.29.197-.633.303-.984.303h-.886l3.368 7.68a.75.75 0 0 1-.209.878c-.08.065-.16.126-.31.223a6 6 0 0 1-.792.433a6.9 6.9 0 0 1-2.876.62a6.9 6.9 0 0 1-2.876-.62a6 6 0 0 1-.792-.433a4 4 0 0 1-.309-.221a.76.76 0 0 1-.21-.88L3.93 7.5H2.353a.75.75 0 0 1 0-1.5h4.102q.076 0 .141-.043l1.695-1.154c.29-.198.634-.303.985-.303h1.974V2.75a.75.75 0 0 1 1.5 0M2.193 15.198a5.4 5.4 0 0 0 2.557.635a5.4 5.4 0 0 0 2.557-.635L4.75 9.368Zm14.51-.024q.123.06.275.126c.53.223 1.305.45 2.272.45a5.85 5.85 0 0 0 2.547-.576L19.25 9.367Z" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <h3 className="text-2xl font-heading uppercase text-white">
                        Provably Fair
                      </h3>
                    </div>
                    <p className="text-[#8A8B91] mb-6 font-body text-center">
                      All in-house games use a provably fair algorithm to ensure
                      complete transparency and fairness. Each game outcome can be
                      independently verified.
                    </p>
                    <div className="mt-auto">
                      <Link href="/provably-fair">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer">
                          Learn More <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>


                <Link href="/goated-token" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <Coins className="h-8 w-8 text-[#D7FF00]" />
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          THE GOATED AIRDROP
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          COMING SOON
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Upcoming token launch with exclusive benefits for holders. Get
                        airdrops based on your wagered amount and unlock special
                        perks.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                          Learn About Airdrops <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/promotions" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="text-[#D7FF00]">
                          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
                            <path d="M14.926 2.911L8.274 6.105a2.43 2.43 0 0 1-1.617.182a8 8 0 0 0-.695-.14C4.137 5.94 3 7.384 3 9.045v.912c0 1.66 1.137 3.105 2.962 2.896a7 7 0 0 0 .695-.139a2.43 2.43 0 0 1 1.617.183l6.652 3.193c1.527.733 2.291 1.1 3.142.814c.852-.286 1.144-.899 1.728-2.125a12.17 12.17 0 0 0 0-10.556c-.584-1.226-.876-1.84-1.728-2.125c-.851-.286-1.615.08-3.142.814" />
                            <path d="M11.458 20.77L9.967 22c-3.362-2.666-2.951-3.937-2.951-9H8.15c.46 2.86 1.545 4.216 3.043 5.197c.922.604 1.112 1.876.265 2.574M7.5 12.5v-6" />
                          </g>
                        </svg>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          PROMOTIONS
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          DAILY
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Discover daily promotions, bonuses, and special events. Take advantage
                        of exclusive offers and boost your gaming experience.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                          View Promotions <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/telegram" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="text-[#D7FF00]">
                          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path stroke-dasharray="20" stroke-dashoffset="20" d="M21 5l-2.5 15M21 5l-12 8.5">
                              <animate fill="freeze" attributeName="stroke-dashoffset" dur="1s" values="20;0" />
                            </path>
                            <path stroke-dasharray="24" stroke-dashoffset="24" d="M21 5l-19 7.5">
                              <animate fill="freeze" attributeName="stroke-dashoffset" dur="1s" values="24;0" />
                            </path>
                            <path stroke-dasharray="14" stroke-dashoffset="14" d="M18.5 20l-9.5 -6.5">
                              <animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.75s" values="14;0" />
                            </path>
                            <path stroke-dasharray="10" stroke-dashoffset="10" d="M2 12.5l7 1">
                              <animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.75s" values="10;0" />
                            </path>
                            <path stroke-dasharray="8" stroke-dashoffset="8" d="M12 16l-3 3M9 13.5l0 5.5">
                              <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.75s" dur="0.75s" values="8;0" />
                            </path>
                          </g>
                        </svg>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          TELEGRAM GROUP
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          JOIN NOW
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Join our Telegram community for exclusive updates, bonus codes,
                        and instant support. Stay connected with fellow players.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                          Join Community <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/crypto-swap" className="block">
                  <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
                      <div className="flex items-start mb-4">
                        <Repeat className="h-8 w-8 text-[#D7FF00]" />
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-heading uppercase text-white">
                          CRYPTO SWAP
                        </h3>
                        <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
                          NEW
                        </span>
                      </div>
                      <p className="text-[#8A8B91] mb-6 font-body text-center">
                        Easily swap between cryptocurrencies with our secure integration. Fast, convenient, and reliable exchanges.
                      </p>
                      <div className="mt-auto">
                        <span className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors">
                          Start Swapping <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
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
      <CryptoSwapTooltip />
    </div>
  );
}