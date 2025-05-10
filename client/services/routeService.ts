import React from "react";
import { Route } from "wouter";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import VipTransfer from "@/pages/VipTransfer";
import ProvablyFair from "@/pages/ProvablyFair";
import WagerRaces from "@/pages/WagerRaces";
import BonusCodes from "@/pages/BonusCodes";
import NotificationPreferences from "@/pages/notification-preferences";
import WagerRaceManagement from "@/pages/admin/WagerRaceManagement";
import UserManagement from "@/pages/admin/UserManagement";
import NotificationManagement from "@/pages/admin/NotificationManagement";
import BonusCodeManagement from "@/pages/admin/BonusCodeManagement";
import SupportManagement from "@/pages/admin/SupportManagement";
import Leaderboard from "@/pages/Leaderboard";
import Help from "@/pages/Help";
import UserProfile from "@/pages/UserProfile";
import Telegram from "@/pages/Telegram";
import HowItWorks from "@/pages/HowItWorks";
import GoatedToken from "@/pages/GoatedToken";
import Support from "@/pages/support";
import FAQ from "@/pages/faq";
import VipProgram from "@/pages/VipProgram";
import TipsAndStrategies from "@/pages/tips-and-strategies";
import Promotions from "@/pages/Promotions";
import Challenges from "@/pages/Challenges";
import WheelChallenge from "@/pages/WheelChallenge";
import GoombasAdminLogin from "@/pages/GoombasAdminLogin";
import GoombasAdminDashboard from "@/pages/GoombasAdminDashboard";
import CryptoSwap from "@/pages/CryptoSwap";
import { AdminRoute } from "@/components/AdminRoute";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";

export const publicRoutes = [
  { path: "/", component: Home },
  { path: "/auth", component: AuthPage },
  { path: "/wager-races", component: WagerRaces },
  { path: "/leaderboard", component: Leaderboard },
  { path: "/tips-and-strategies", component: TipsAndStrategies },
  { path: "/promotions", component: Promotions },
  { path: "/help", component: Help },
  { path: "/provably-fair", component: ProvablyFair },
  { path: "/telegram", component: Telegram },
  { path: "/how-it-works", component: HowItWorks },
  { path: "/goated-token", component: GoatedToken },
  { path: "/faq", component: FAQ },
  { path: "/vip-program", component: VipProgram },
  { path: "/challenges", component: Challenges },
  { path: "/user-profile/:id", component: UserProfile },
  { path: "/user/:id", component: UserProfile },
];

export const protectedRoutes = [
  { path: "/bonus-codes", component: BonusCodes },
  { path: "/notification-preferences", component: NotificationPreferences },
  { path: "/vip-transfer", component: VipTransfer },
  { path: "/support", component: Support },
  { path: "/wheel-challenge", component: WheelChallenge },
];

export const adminRoutes = [
  { path: "/admin/user-management", component: UserManagement },
  { path: "/admin/wager-races", component: WagerRaceManagement },
  { path: "/admin/bonus-codes", component: BonusCodeManagement },
  { path: "/admin/notifications", component: NotificationManagement },
  { path: "/admin/support", component: SupportManagement },
];

export const goombasAdminRoutes = [
  { path: "/goombas.net/login", component: GoombasAdminLogin },
  { path: "/goombas.net/dashboard", component: GoombasAdminDashboard },
];

import NotFound from "@/pages/not-found";

export const cryptoSwapRoute = { path: "/crypto-swap", component: CryptoSwap };

export const notFoundRoute = { component: NotFound };
