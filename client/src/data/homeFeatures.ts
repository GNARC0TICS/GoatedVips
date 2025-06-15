import { LucideProps } from 'lucide-react'; // For typing icon props if needed

export interface FeatureCardData {
  id: string;
  iconName?: string; // Key for IconMap, optional if customIcon is provided directly
  customIconComponent?: React.ElementType; // For direct component rendering if not using IconMap
  rawSVG?: string; // If we want to pass raw SVG strings (less ideal for this structure)
  iconProps?: LucideProps & { className?: string }; // Optional props for the icon
  title: string;
  description: string | ((isAuthenticated: boolean) => string); // Can be a function of auth state
  link: string;
  requiresAuth?: boolean; // To show lock icon or different text
  authSensitiveLink?: boolean; // If the link itself changes or is disabled
  badgeText?: string | ((isAuthenticated: boolean) => string);
  badgeType?: 'NEW' | 'LIVE' | 'COMING SOON' | 'DAILY' | 'SIGN IN TO PLAY' | 'PLAY NOW' | 'JOIN NOW' | ((isAuthenticated: boolean) => string); // To style badge
  ctaText: string | ((isAuthenticated: boolean) => string);
  ctaLink?: string; // Optional: if CTA is a separate link from the main card link
  ctaRequiresAuthAction?: boolean; // If CTA behavior changes significantly based on auth (e.g. Link vs Tooltip)
  className?: string; // Additional styling for the card
  group: number; // Group number for layout organization
}

export const homeFeatures: FeatureCardData[] = [
  {
    id: "bonus-codes",
    iconName: "custom:BonusCodeIcon", // Placeholder for the DatabaseCode-like SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "Bonus Codes",
    description: (isAuthenticated) =>
      isAuthenticated
        ? "Exclusive bonus codes updated regularly. Claim special rewards and boost your gaming experience."
        : "Sign in to access exclusive bonus codes and rewards",
    link: "/bonus-codes",
    requiresAuth: true, // Shows lock icon when not authenticated
    authSensitiveLink: true, // The link behavior changes (Link vs Tooltip)
    ctaText: (isAuthenticated) => (isAuthenticated ? "View Codes" : "Locked"),
    ctaRequiresAuthAction: true,
    group: 1,
  },
  {
    id: "vip-transfer",
    iconName: "custom:VipTransferIcon", // Placeholder for the house swap / transfer SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "VIP Transfer",
    description: "Transfer your VIP status from other platforms and get cash bonuses.",
    link: "/vip-transfer",
    ctaText: "Find out more",
    group: 1,
  },
  {
    id: "wager-races",
    iconName: "custom:WagerRacesIcon", // Placeholder for the racing flag SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "Wager Races",
    description: "Compete in exclusive wager races for massive prize pools and rewards.",
    link: "/wager-races",
    badgeText: "LIVE",
    badgeType: "LIVE",
    ctaText: "How it works",
    group: 1,
  },
  {
    id: "challenges",
    iconName: "custom:ChallengesIcon", // Placeholder for the shield/badge SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "Challenges",
    description: "Complete daily and weekly challenges to earn exclusive rewards and boost your earnings.",
    link: "/challenges", // Assuming this link, it was a span before
    badgeText: "NEW",
    badgeType: "NEW",
    ctaText: "View Challenges",
    group: 1,
  },
  {
    id: "wheel-spin",
    iconName: "custom:WheelSpinIcon", // Placeholder for the wheel SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "Wheel Spin",
    description: (isAuthenticated) =>
      `Spin the wheel daily for a chance to win exclusive bonus codes and rewards!${!isAuthenticated ? " Sign in to start winning daily prizes." : ""}`,
    link: "/wheel-challenge",
    requiresAuth: true,
    badgeText: (isAuthenticated) => (isAuthenticated ? "PLAY NOW" : "SIGN IN TO PLAY"),
    badgeType: (isAuthenticated) => (isAuthenticated ? "PLAY NOW" : "SIGN IN TO PLAY"),
    ctaText: (isAuthenticated) => (isAuthenticated ? "Try Your Luck" : "Sign In to Play"),
    authSensitiveLink: true, // The CTA text and badge change
    group: 1,
  },
  {
    id: "provably-fair",
    iconName: "custom:ProvablyFairIcon", // Placeholder for the scales SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "Provably Fair",
    description: "All in-house games use a provably fair algorithm to ensure complete transparency and fairness. Each game outcome can be independently verified.",
    link: "/provably-fair",
    ctaText: "Learn More",
    group: 1,
  },
  {
    id: "goated-airdrop",
    iconName: "Coins", // Lucide Icon
    iconProps: { className: "h-8 w-8 text-[#D7FF00]" },
    title: "THE GOATED AIRDROP",
    description: "Upcoming token launch with exclusive benefits for holders. Get airdrops based on your wagered amount and unlock special perks.",
    link: "/goated-token",
    badgeText: "COMING SOON",
    badgeType: "COMING SOON",
    ctaText: "Learn About Airdrops",
    group: 2,
  },
  {
    id: "promotions",
    iconName: "custom:PromotionsIcon", // Placeholder for the megaphone-like SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "PROMOTIONS",
    description: "Discover daily promotions, bonuses, and special events. Take advantage of exclusive offers and boost your gaming experience.",
    link: "/promotions",
    badgeText: "DAILY",
    badgeType: "DAILY",
    ctaText: "View Promotions",
    group: 2,
  },
  {
    id: "telegram-group",
    iconName: "custom:TelegramIcon", // Placeholder for the paper plane SVG
    iconProps: { className: "text-[#D7FF00]" },
    title: "TELEGRAM GROUP",
    description: "Join our Telegram community for exclusive updates, bonus codes, and instant support. Stay connected with fellow players.",
    link: "/telegram",
    badgeText: "JOIN NOW",
    badgeType: "JOIN NOW",
    ctaText: "Join Community",
    group: 2,
  },
  {
    id: "crypto-swap",
    iconName: "Repeat", // Lucide Icon
    iconProps: { className: "h-8 w-8 text-[#D7FF00]" },
    title: "CRYPTO SWAP",
    description: "Easily swap between cryptocurrencies with our secure integration. Fast, convenient, and reliable exchanges.",
    link: "/crypto-swap",
    badgeText: "NEW",
    badgeType: "NEW",
    ctaText: "Start Swapping",
    group: 2,
  },
]; 