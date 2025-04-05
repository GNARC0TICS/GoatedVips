import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Gift,
  Lock,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SelectUser } from "@db/schema";
import { ScrollToTop } from "./ScrollToTop";
import { UserSearch } from "./UserSearch";
import { ParticleBackground } from "./ParticleBackground";
import { containerStyles, cardStyles, textStyles, buttonStyles, navStyles, footerStyles } from "@/lib/style-constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UtilityPanelButton } from "./UtilityPanel";
import { TelegramButton } from "./TelegramButton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import giftIcon from '/images/GIFT.png';

// --- Static Styles ---
// Styles moved to style-constants.ts for reusability

// Component-specific styles
const headerClasses = {
  container: navStyles.header,
  nav: `${containerStyles.page} ${navStyles.nav}`,
  logo: "h-8 w-auto relative transition-transform duration-300 hover:scale-105",
  menuButton: navStyles.mobileButton,
  desktopNav: navStyles.desktop,
  userSection: "flex items-center gap-2 md:gap-3",
};

const authSectionClasses = {
  container: `${containerStyles.page} flex justify-end mt-16 pt-2`,
  wrapper: "hidden md:flex items-center gap-3 z-40 absolute right-4",
  buttons: "flex items-center gap-2",
};

const dropdownClasses = {
  content: "w-56 bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1",
  item: "px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer",
};

/**
 * Mobile Navigation Link Component
 * 
 * Optimized mobile navigation link with proper typings and ARIA attributes.
 */
interface MobileNavLinkProps {
  href: string;
  label: string | React.ReactNode;
  onClose: () => void;
  isTitle?: boolean;
  externalLink?: boolean;
}

const MobileNavLink = React.memo(function MobileNavLink({
  href,
  label,
  onClose,
  isTitle = false,
  externalLink = false,
}: MobileNavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const isHome = href === "/";
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        role="menuitem"
        aria-current={isActive ? "page" : undefined}
        className={`px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer ${
          isActive ? "bg-[#D7FF00]/10 text-[#D7FF00]" : "text-white hover:bg-[#2A2B31]"
        } ${isTitle || isHome ? "text-base font-bold" : "text-sm"}`}
      >
        {label}
      </motion.div>
    </Link>
  );
});

/**
 * Desktop Navigation Link Component
 * 
 * Optimized desktop navigation link with proper typings and ARIA attributes.
 */
interface NavLinkProps {
  href: string;
  label: string | React.ReactNode;
  tooltip?: string;
  externalLink?: boolean;
}

const NavLink = React.memo(function NavLink({ 
  href, 
  label, 
  tooltip,
  externalLink = false
}: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;

  const linkContent = (
    <motion.div
      className={`relative font-heading cursor-pointer ${
        isActive ? "text-[#D7FF00]" : "text-white"
      } hover:text-[#D7FF00] transition-all duration-300`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      <motion.div
        className="absolute -bottom-1 left-0 h-0.5 bg-[#D7FF00] origin-left"
        initial={{ scaleX: isActive ? 1 : 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {externalLink ? (
          <a href={href} target="_blank" rel="noopener noreferrer">{linkContent}</a>
        ) : (
          <Link href={href}>{linkContent}</Link>
        )}
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent sideOffset={5} className="bg-[#1A1B21] border-[#2A2B31] text-white">
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
});

/**
 * Main Layout Component
 * 
 * Provides the application layout structure with navigation, main content area,
 * and footer. Includes performance optimizations and accessibility improvements.
 */
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const footerRef = useRef<HTMLElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const { toast } = useToast();
  const [openMobile, setOpenMobile] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery<SelectUser>({ queryKey: ["/api/user"] });
  const isAuthenticated = !!user;

  // Scroll to top on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Set up IntersectionObserver to detect footer visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (footerRef.current) {
      observer.observe(footerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const [, setLocation] = useLocation();

  // Memoize logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      toast({
        title: "Success",
        description: "Logged out successfully"
      });

      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, queryClient, setLocation]);

  // Memoize the footer to prevent unnecessary re-renders
  const memoizedFooter = useMemo(() => (
    <footer ref={footerRef} className={footerStyles.wrapper}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent pointer-events-none" />
      <div className={footerStyles.content}>
        <div className={footerStyles.grid}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h4 className={footerStyles.heading}>
                Ready to get Goated?
              </h4>
              <a
                href="https://www.goated.com/r/VIPBOOST"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-110"
              >
                <img
                  src="/images/Goated Logo - Black.png"
                  alt="Goated"
                  className="h-8 w-auto entrance-zoom wiggle-animation"
                  loading="lazy"
                />
              </a>
            </div>
            <p className="text-[#14151A] mb-6">
              Sign up now and enjoy additional rewards from our side. Start
              your journey to becoming a casino legend!
            </p>
            <Button
              onClick={() =>
                window.open("https://www.goated.com/r/EARLYACCESS", "_blank")
              }
              className="bg-[#14151A] text-white hover:bg-[#14151A]/90 transition-colors"
            >
              Sign Up Now
            </Button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h4 className={footerStyles.heading}>
                Stay Updated
              </h4>
              <a
                href="https://t.me/+iFlHl5V9VcszZTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-110"
              >
                <img
                  src="/images/Goated logo with text.png"
                  alt="Goated"
                  className="h-[4.5rem] w-auto object-contain"
                  loading="lazy"
                />
              </a>
            </div>
            <p className="text-[#14151A] mb-6">
              Subscribe to our newsletter for exclusive offers and updates!
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-[#14151A]/20 focus:outline-none focus:border-[#14151A] transition-colors duration-300"
                aria-label="Email for newsletter"
              />
              <Button className="bg-[#14151A] text-white hover:bg-[#14151A]/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-[#14151A] text-[#8A8B91] text-sm py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4">
              <a
                href="https://www.goated.com/r/VIPBOOST"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  src="/images/Goated logo with text.png"
                  alt="Goated"
                  className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
                  loading="lazy"
                />
              </a>
              <a
                href="https://t.me/+iFlHl5V9VcszZTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  src="/images/Goated logo with text1.png"
                  alt="Goated Partner"
                  className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
                  loading="lazy"
                />
              </a>
            </div>
          </div>
          <p className="mb-2">
            © 2024 GoatedVips.gg. All rights reserved.
          </p>
          <p className="mb-2">
            Disclaimer: This website is an independent platform and is not affiliated with, endorsed by, or officially connected to Goated.com.
          </p>
          <p>Gamble responsibly. 18+ only. BeGambleAware.org</p>
        </div>
      </div>
    </footer>
  ), []);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#14151A]">
      <ParticleBackground />
      <header className={headerClasses.container}>
        <nav className={headerClasses.nav} role="navigation" aria-label="Main Navigation">
          <div className="flex items-center gap-6">
            <Link href="/">
              <img src="/images/logo-neon.png" alt="GOATED" className={headerClasses.logo} />
            </Link>

            <div className={headerClasses.desktopNav} role="menubar" aria-label="Desktop Menu">
              <NavLink href="/" label="HOME" />
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="font-bold">EVENTS</span>
                </Button>
                <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                  <div className="bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1">
                    <Link href="/wager-races">
                      <div className="px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
                        <span className="flex items-center gap-2">
                          Monthly Race
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs text-red-500">LIVE</span>
                          </div>
                        </span>
                      </div>
                    </Link>
                    <Link href="/challenges">
                      <div className="px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
                        <span>Challenges</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <Link href="/how-it-works">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="font-bold">GET STARTED</span>
                  </Button>
                </Link>
                <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
                  <div className="bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1">
                    <Link href="/how-it-works">
                      <div className="px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
                        <span>Become an Affiliate</span>
                      </div>
                    </Link>
                    <Link href="/vip-transfer">
                      <div className="px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
                        <span>VIP Transfer</span>
                      </div>
                    </Link>
                    <Link href="/tips-and-strategies">
                      <div className="px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
                        <span>Tips & Strategies</span>
                      </div>
                    </Link>
                    <Link href="/vip-program">
                      <div className="px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
                        <span>VIP Program</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <Link href="/promotions">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="font-bold">PROMOTIONS</span>
                  </Button>
                </Link>
                <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
                  <div className="bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1">
                    <Link href="/promotions">
                      <div className={dropdownClasses.item}>
                        News & Promotions
                      </div>
                    </Link>
                    <Link href="/goated-token">
                      <div className={dropdownClasses.item}>
                        Goated Airdrop
                      </div>
                    </Link>
                    <Link href="/bonus-codes">
                      <div className={dropdownClasses.item}>
                        {isAuthenticated ? "Bonus Codes" : (
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
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <Link href="/leaderboard?period=daily">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="font-bold">LEADERBOARDS</span>
                  </Button>
                </Link>
                <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
                  <div className="bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1">
                    <Link href="/leaderboard?period=daily">
                      <div className={dropdownClasses.item}>
                        Daily
                      </div>
                    </Link>
                    <Link href="/leaderboard?period=weekly">
                      <div className={dropdownClasses.item}>
                        Weekly
                      </div>
                    </Link>
                    <Link href="/leaderboard?period=monthly">
                      <div className={dropdownClasses.item}>
                        Monthly
                      </div>
                    </Link>
                    <Link href="/leaderboard?period=all_time">
                      <div className={dropdownClasses.item}>
                        All Time
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Socials tab removed in favor of direct icon in the user section */}

              {user?.isAdmin && (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="font-bold">ADMIN</span>
                  </Button>
                  <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
                    <div className="bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1">
                      <Link href="/admin/user-management">
                        <div className={dropdownClasses.item}>
                          User Management
                        </div>
                      </Link>
                      <Link href="/admin/notifications">
                        <div className={dropdownClasses.item}>
                          Notification Management
                        </div>
                      </Link>
                      <Link href="/admin/support">
                        <div className={dropdownClasses.item}>
                          Support Management
                        </div>
                      </Link>
                      <Link href="/admin/wager-races">
                        <div className={dropdownClasses.item}>
                          Wager Race Management
                        </div>
                      </Link>
                      <Link href="/admin/bonus-codes">
                        <div className={dropdownClasses.item}>
                          Bonus Code Management
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={headerClasses.menuButton}>
              <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-[#D7FF00]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    <Menu className="h-6 w-6 text-white relative z-10 group-hover:text-[#D7FF00] transition-colors duration-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] bg-[#14151A] border-r border-[#2A2B31] overflow-y-auto p-0"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4 pt-8"
                  >
                    <div className="px-4 py-2 text-[#D7FF00] font-heading text-base font-bold">MENU</div>
                    <MobileNavLink href="/" label="HOME" onClose={() => setOpenMobile(false)} isTitle={true} />

                    <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">EVENTS</div>
                    <MobileNavLink
                      href="/wager-races"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span>Monthly Race</span>
                          <div className="ml-2 flex items-center gap-1">
                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs text-red-500">LIVE</span>
                          </div>
                        </div>
                      }
                      onClose={() => setOpenMobile(false)}
                    />
                    <MobileNavLink
                      href="/challenges"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span>Challenges</span>
                          <div className="ml-2 flex items-center gap-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-500">ONGOING</span>
                          </div>
                        </div>
                      }
                      onClose={() => setOpenMobile(false)}
                    />

                    <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">GET STARTED</div>
                    <MobileNavLink href="/how-it-works" label="Become an Affiliate" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink href="/vip-transfer" label="VIP Transfer" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink href="/tips-and-strategies" label="Tips & Strategies" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink href="/vip-program" label="VIP Program" onClose={() => setOpenMobile(false)} />

                    <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">PROMOTIONS</div>
                    <MobileNavLink href="/promotions" label="News & Promotions" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink href="/goated-token" label="Goated Airdrop" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink
                      href="/bonus-codes"
                      label={
                        isAuthenticated ? (
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
                        )
                      }
                      onClose={() => setOpenMobile(false)}
                    />

                    <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">LEADERBOARDS</div>
                    <MobileNavLink
                      href="/leaderboard?period=daily"
                      label="Daily Leaderboard"
                      onClose={() => setOpenMobile(false)}
                    />
                    <MobileNavLink
                      href="/leaderboard?period=weekly"
                      label="Weekly Leaderboard"
                      onClose={() => setOpenMobile(false)}
                    />
                    <MobileNavLink
                      href="/leaderboard?period=monthly"
                      label="Monthly Leaderboard"
                      onClose={() => setOpenMobile(false)}
                    />
                    <MobileNavLink
                      href="/leaderboard?period=all-time"
                      label="All Time Leaderboard"
                      onClose={() => setOpenMobile(false)}
                    />

                    <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">SOCIALS</div>
                    <MobileNavLink href="/telegram" label="Telegram Community" onClose={() => setOpenMobile(false)} />

                    <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">HELP & SUPPORT</div>
                    <MobileNavLink href="/help" label="Help Center" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink href="/faq" label="FAQ" onClose={() => setOpenMobile(false)} />
                    <MobileNavLink
                      href="https://t.me/xGoombas"
                      label="Contact Support"
                      onClose={() => {
                        setOpenMobile(false);
                        window.open("https://t.me/xGoombas", "_blank");
                      }}
                    />

                    {user?.isAdmin && (
                      <>
                        <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">ADMIN</div>
                        <MobileNavLink href="/admin/user-management" label="User Management" onClose={() => setOpenMobile(false)} />
                        <MobileNavLink href="/admin/wager-races" label="Wager Race Management" onClose={() => setOpenMobile(false)} />
                        <MobileNavLink href="/admin/bonus-codes" label="Bonus Code Management" onClose={() => setOpenMobile(false)} />
                        <MobileNavLink href="/admin/notifications" label="Notification Management" onClose={() => setOpenMobile(false)} />
                        <MobileNavLink href="/admin/support" label="Support Management" onClose={() => setOpenMobile(false)} />
                      </>
                    )}

                    <div className="mt-6 px-4 border-t border-[#2A2B31]/50 pt-6 space-y-3">
                      {/* Auth controls if not logged in */}
                      {!user && (
                        <div onClick={() => setOpenMobile(false)}>
                          <AuthModal isMobile={true} />
                        </div>
                      )}

                      {/* Play button */}
                      <Button
                        onClick={() => {
                          setOpenMobile(false);
                          window.open("https://www.goated.com/r/SPIN", "_blank");
                        }}
                        className="w-full bg-[#D7FF00] text-[#14151A] hover:bg-[#D7FF00]/90 transition-colors font-bold group"
                      >
                        <span className="flex items-center gap-1">
                          PLAY NOW
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24"
                            className="ml-1"
                          >
                            <path 
                              fill="currentColor" 
                              fillOpacity="0" 
                              stroke="currentColor" 
                              strokeDasharray="40" 
                              strokeDashoffset="40" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M8 6l10 6l-10 6Z"
                            >
                              <animate 
                                fill="freeze" 
                                attributeName="fill-opacity" 
                                begin="0s" 
                                dur="0.8s" 
                                values="0;1" 
                              />
                              <animate 
                                fill="freeze" 
                                attributeName="stroke-dashoffset" 
                                dur="0.8s" 
                                values="40;0" 
                              />
                            </path>
                          </svg>
                        </span>
                      </Button>

                      {/* Logout if logged in */}
                      {user && (
                        <Button
                          onClick={handleLogout}
                          variant="destructive"
                          className="w-full"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className={headerClasses.userSection}>
            {/* User search component - Improved visibility */}
            <div className="w-full max-w-[170px]">
              <UserSearch />
            </div>

            {/* Telegram Button - Public access to our community */}
            <TelegramButton size="md" />

            {/* Gift Button */}
            <UtilityPanelButton />

            {/* Admin Button - Only show when user is admin */}
            {user?.isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#D7FF00] hover:text-white relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center group"
                  >
                    <div className="absolute inset-0 bg-[#D7FF00]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg" />
                    <Settings className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1A1B21] border-[#2A2B31]">
                  <DropdownMenuLabel className="text-[#D7FF00]">Admin Panel</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/admin/user-management">
                    <DropdownMenuItem className="cursor-pointer text-white">
                      User Management
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin/wager-races">
                    <DropdownMenuItem className="cursor-pointer text-white">
                      Wager Races
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin/bonus-codes">
                    <DropdownMenuItem className="cursor-pointer text-white">
                      Bonus Codes
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin/notifications">
                    <DropdownMenuItem className="cursor-pointer text-white">
                      Notifications
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin/api-sync">
                    <DropdownMenuItem className="cursor-pointer text-white">
                      API Sync
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Authentication controls are now moved below the header */}

            {/* User Profile Button - Only show when logged in */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 md:gap-2 text-white px-2 md:px-4 h-8 md:h-10 hover:text-[#D7FF00] transition-all duration-300"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">
                      {user.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1A1B21] border-[#2A2B31]">
                  <DropdownMenuLabel className="text-[#D7FF00]">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/user/${user.id}`}>
                    <DropdownMenuItem className="cursor-pointer text-white">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/notification-preferences">
                    <DropdownMenuItem className="cursor-pointer text-white">
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[#D7FF00]">Admin Panel</DropdownMenuLabel>
                      <Link href="/admin/user-management">
                        <DropdownMenuItem className="cursor-pointer text-white">
                          User Management
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/admin/wager-races">
                        <DropdownMenuItem className="cursor-pointer text-white">
                          Wager Races
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/admin/bonus-codes">
                        <DropdownMenuItem className="cursor-pointer text-white">
                          Bonus Codes
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/admin/notifications">
                        <DropdownMenuItem className="cursor-pointer text-white">
                          Notifications
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/admin/api-sync">
                        <DropdownMenuItem className="cursor-pointer text-white">
                          API Sync
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
      </header>

      {/* Auth Section - Desktop Only */}
      <div className={authSectionClasses.container}>
        <div className={authSectionClasses.wrapper}>
          {/* PLAY button - always visible */}
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-[#2A2B31] hover:bg-[#2A2B31]/50 hover:text-white">
                    Login / Register
                  </Button>
                </Link>
                <Link href="/play">
                  <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90 uppercase font-heading">
                    Play Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {children}
      <ScrollToTop />
      <footer ref={footerRef} className={footerStyles.wrapper}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent pointer-events-none" />
        <div className={footerStyles.content}>
          <div className={footerStyles.grid}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h4 className={footerStyles.heading}>
                  Ready to get Goated?
                </h4>
                <a
                  href="https://www.goated.com/r/VIPBOOST"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-transform duration-300 hover:scale-110"
                >
                  <img
                    src="/images/Goated Logo - Black.png"
                    alt="Goated"
                    className="h-8 w-auto entrance-zoom wiggle-animation"
                  />
                </a>
              </div>
              <p className="text-[#14151A] mb-6">
                Sign up now and enjoy additional rewards from our side. Start
                your journey to becoming a casino legend!
              </p>
              <Button
                onClick={() =>
                  window.open("https://www.goated.com/r/EARLYACCESS", "_blank")
                }
                className="bg-[#14151A] text-white hover:bg-[#14151A]/90 transition-colors"
              >
                Sign Up Now
              </Button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h4 className={footerStyles.heading}>
                  Stay Updated
                </h4>
                <a
                  href="https://t.me/+iFlHl5V9VcszZTVh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-transform duration-300 hover:scale-110"
                >
                  <img
                    src="/images/Goated logo with text.png"
                    alt="Goated"
                    className="h-[4.5rem] w-auto object-contain"
                  />
                </a>
              </div>
              <p className="text-[#14151A] mb-6">
                Subscribe to our newsletter for exclusive offers and updates!
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-[#14151A]/20 focus:outline-none focus:border-[#14151A] transition-colors duration-300"
                />
                <Button className="bg-[#14151A] text-white hover:bg-[#14151A]/90">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
        <div className="bg-[#14151A] text-[#8A8B91] text-sm py-6">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4">
                <a
                  href="https://www.goated.com/r/VIPBOOST"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/images/Goated logo with text.png"
                    alt="Goated"
                    className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
                  />
                </a>
                <a
                  href="https://t.me/+iFlHl5V9VcszZTVh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/images/Goated logo with text1.png"
                    alt="Goated Partner"
                    className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
                  />
                </a>
              </div>
            </div>
            <p className="mb-2">
              © 2024 GoatedVips.gg. All rights reserved.
            </p>
            <p className="mb-2">
              Disclaimer: This website is an independent platform and is not affiliated with, endorsed by, or officially connected to Goated.com.
            </p>
            <p>Gamble responsibly. 18+ only. BeGambleAware.org</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
