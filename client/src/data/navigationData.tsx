import React from "react";
import { Lock } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const giftIcon = "/images/GIFT.png";

// Navigation item types
export interface NavigationItem {
  id: string;
  href: string;
  label: string | ((props: NavigationLabelProps) => React.ReactNode);
  requiresAuth?: boolean;
  isExternal?: boolean;
  section?: string;
  badge?: {
    text: string;
    color: 'red' | 'green' | 'blue' | 'yellow';
    animate?: boolean;
  };
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export interface NavigationLabelProps {
  isAuthenticated: boolean;
  onClose?: () => void;
}

// Shared navigation data structure
export const navigationSections: NavigationSection[] = [
  {
    id: "main",
    title: "MENU",
    items: [
      {
        id: "home",
        href: "/",
        label: "HOME",
      },
    ],
  },
  {
    id: "events",
    title: "EVENTS",
    items: [
      {
        id: "wager-races",
        href: "/wager-races",
        label: ({ onClose }: NavigationLabelProps): React.ReactNode => {
          return (
            <div className="flex items-center justify-between w-full">
              <span>Monthly Race</span>
              <div className="ml-2 flex items-center gap-1">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-500">LIVE</span>
              </div>
            </div>
          );
        },
        badge: { text: "LIVE", color: "red", animate: true },
      },
      {
        id: "challenges",
        href: "/challenges",
        label: ({ onClose }: NavigationLabelProps): React.ReactNode => {
          return (
            <div className="flex items-center justify-between w-full">
              <span>Challenges</span>
              <div className="ml-2 flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-500">ONGOING</span>
              </div>
            </div>
          );
        },
        badge: { text: "ONGOING", color: "green", animate: true },
      },
    ],
  },
  {
    id: "get-started",
    title: "GET STARTED",
    items: [
      {
        id: "become-affiliate",
        href: "/how-it-works",
        label: "Become an Affiliate",
      },
      {
        id: "vip-transfer",
        href: "/vip-transfer",
        label: "VIP Transfer",
      },
      {
        id: "tips-strategies",
        href: "/tips-and-strategies",
        label: "Tips & Strategies",
      },
      {
        id: "vip-program",
        href: "/vip-program",
        label: "VIP Program",
      },
    ],
  },
  {
    id: "promotions",
    title: "PROMOTIONS",
    items: [
      {
        id: "news-promotions",
        href: "/promotions",
        label: "News & Promotions",
      },
      {
        id: "goated-airdrop",
        href: "/goated-token",
        label: "Goated Airdrop",
      },
      {
        id: "bonus-codes",
        href: "/bonus-codes",
        label: ({ isAuthenticated }: NavigationLabelProps): React.ReactNode => {
          return isAuthenticated ? (
            <div className="flex items-center gap-2">
              <img src={giftIcon} alt="Gift" className="h-4 w-4" />
              <span>Bonus Codes</span>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <span>Bonus Codes</span>
                  <Lock className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sign in to access bonus codes and rewards</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        requiresAuth: true,
      },
    ],
  },
  {
    id: "leaderboards",
    title: "LEADERBOARDS",
    items: [
      {
        id: "daily-leaderboard",
        href: "/leaderboard?period=daily",
        label: "Daily Leaderboard",
      },
      {
        id: "weekly-leaderboard",
        href: "/leaderboard?period=weekly",
        label: "Weekly Leaderboard",
      },
      {
        id: "monthly-leaderboard",
        href: "/leaderboard?period=monthly",
        label: "Monthly Leaderboard",
      },
      {
        id: "all-time-leaderboard",
        href: "/leaderboard?period=all-time",
        label: "All Time Leaderboard",
      },
    ],
  },
  {
    id: "socials",
    title: "SOCIALS",
    items: [
      {
        id: "telegram",
        href: "https://t.me/xGoombas",
        label: ({ onClose }: NavigationLabelProps): React.ReactNode => {
          return (
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M228.88 26.19a9 9 0 0 0-9.16-1.57L17.06 103.93a14.22 14.22 0 0 0 2.43 27.21L72 141.45V200a15.92 15.92 0 0 0 10 14.83a15.91 15.91 0 0 0 17.51-3.73l25.32-26.26L165 220a15.88 15.88 0 0 0 10.51 4a16.3 16.3 0 0 0 5-.79a15.85 15.85 0 0 0 10.67-11.63L231.77 35a9 9 0 0 0-2.89-8.81M78.15 126.35l-49.61-9.73l139.2-54.48ZM88 200v-47.48l24.79 21.74Zm87.53 8l-82.68-72.5l119-85.29Z" />
              </svg>
              Telegram Community
            </div>
          );
        },
        isExternal: true,
      },
    ],
  },
  {
    id: "support",
    title: "HELP & SUPPORT",
    items: [
      {
        id: "help-center",
        href: "/help",
        label: "Help Center",
      },
      {
        id: "faq",
        href: "/faq",
        label: "FAQ",
      },
      {
        id: "contact-support",
        href: "https://t.me/xGoombas",
        label: "Contact Support",
        isExternal: true,
      },
    ],
  },
];

// Admin navigation section (only for admin users)
export const adminNavigationSection: NavigationSection = {
  id: "admin",
  title: "ADMIN",
  items: [
    {
      id: "user-management",
      href: "/admin/user-management",
      label: "User Management",
    },
    {
      id: "wager-race-management",
      href: "/admin/wager-races",
      label: "Wager Race Management",
    },
    {
      id: "bonus-code-management",
      href: "/admin/bonus-codes",
      label: "Bonus Code Management",
    },
    {
      id: "notification-management",
      href: "/admin/notifications",
      label: "Notification Management",
    },
    {
      id: "support-management",
      href: "/admin/support",
      label: "Support Management",
    },
  ],
};

// Helper function to get all navigation sections based on user role
export function getNavigationSections(isAdmin: boolean = false): NavigationSection[] {
  const sections = [...navigationSections];
  if (isAdmin) {
    sections.push(adminNavigationSection);
  }
  return sections;
}
