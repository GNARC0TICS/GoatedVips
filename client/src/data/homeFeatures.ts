import { FeatureCardProps } from "@/components/home/FeatureCard";

/**
 * homeFeatures.ts
 * Central config for all home page feature cards.
 * DESIGN AGENT: Add, remove, or edit features as needed. Icons must match keys in IconMap.
 */
export const homeFeatures: FeatureCardProps[] = [
  {
    icon: "Trophy",
    title: "Wager Races",
    description: "Monthly prize races based on your total wager.",
    link: "/wager-races",
    requiresAuth: false,
    badge: "LIVE",
  },
  {
    icon: "Gift",
    title: "Bonus Codes",
    description: "Exclusive bonus codes updated regularly. Claim special rewards and boost your gaming experience.",
    link: "/bonus-codes",
    requiresAuth: true,
    badge: undefined,
  },
  // DESIGN AGENT: Add more features below as needed
]; 