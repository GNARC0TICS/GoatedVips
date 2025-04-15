import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { dropdownClasses } from "@/lib/style-constants";

// Import any assets needed
import giftIcon from '/images/GIFT.png';

// --- MobileNavLink Component ---
type MobileNavLinkProps = {
  href: string;
  label: string | React.ReactNode;
  onClose: () => void;
  isTitle?: boolean;
};

export const MobileNavLink = React.memo(function MobileNavLink({
  href,
  label,
  onClose,
  isTitle = false,
}: MobileNavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const isHome = href === "/";
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          onClose();
        }}
        className={`px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer ${
          isActive ? "bg-[#D7FF00]/10 text-[#D7FF00]" : "text-white hover:bg-[#2A2B31]"
        } ${isTitle || isHome ? "text-base font-bold" : "text-sm"}`}
      >
        {label}
      </motion.div>
    </Link>
  );
});

// --- NavLink Component ---
type NavLinkProps = {
  href: string;
  label: string | React.ReactNode;
  tooltip?: string;
};

export const NavLink = React.memo(function NavLink({ href, label, tooltip }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;

  const linkContent = (
    <motion.div
      className={`relative font-heading cursor-pointer ${
        isActive ? "text-[#D7FF00]" : "text-white"
      } hover:text-[#D7FF00] transition-all duration-300`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
        <Link href={href}>{linkContent}</Link>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent sideOffset={5} className="bg-[#1A1B21] border-[#2A2B31] text-white">
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
});

type MobileNavContentProps = {
  setOpenMobile: (open: boolean) => void;
  isAuthenticated: boolean;
};

export function MobileNavigationContent({ setOpenMobile, isAuthenticated }: MobileNavContentProps) {
  return (
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
      <MobileNavLink 
        href="https://t.me/xGoombas" 
        label="Telegram Community"
        onClose={() => setOpenMobile(false)} 
      />

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
    </motion.div>
  );
}

type DesktopNavLinksProps = {
  isAuthenticated: boolean;
};

export function DesktopNavLinks({ isAuthenticated }: DesktopNavLinksProps) {
  return (
    <>
      <NavLink href="/" label="HOME" />
      <div className="relative group">
        <Button
          variant="ghost"
          className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
        >
          <span className="font-bold">EVENTS</span>
        </Button>
        <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
          <div className={dropdownClasses.content}>
            <Link href="/wager-races">
              <div className={dropdownClasses.item}>
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
              <div className={dropdownClasses.item}>
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
          >
            <span className="font-bold">GET STARTED</span>
          </Button>
        </Link>
        <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
          <div className={dropdownClasses.content}>
            <Link href="/how-it-works">
              <div className={dropdownClasses.item}>
                <span>Become an Affiliate</span>
              </div>
            </Link>
            <Link href="/vip-transfer">
              <div className={dropdownClasses.item}>
                <span>VIP Transfer</span>
              </div>
            </Link>
            <Link href="/tips-and-strategies">
              <div className={dropdownClasses.item}>
                <span>Tips & Strategies</span>
              </div>
            </Link>
            <Link href="/vip-program">
              <div className={dropdownClasses.item}>
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
          >
            <span className="font-bold">PROMOTIONS</span>
          </Button>
        </Link>
        <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
          <div className={dropdownClasses.content}>
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
          >
            <span className="font-bold">LEADERBOARDS</span>
          </Button>
        </Link>
        <div className="absolute left-0 mt-2 w-56 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
          <div className={dropdownClasses.content}>
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
    </>
  );
}
