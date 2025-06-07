import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  LogOut, 
  Lock 
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AuthSection } from "../auth/AuthSection";
import giftIcon from '/images/GIFT.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SelectUser } from "@db/schema";

type MobileNavLinkProps = {
  href: string;
  label: string | React.ReactNode;
  onClose: () => void;
  isTitle?: boolean;
};

const MobileNavLink = React.memo(function MobileNavLink({
  href,
  label,
  onClose,
  isTitle = false,
}: MobileNavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const isHome = href === "/";
  
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onClose();
  };
  
  return (
    <Link href={href}>
      <div
        onClick={handleClick}
        onTouchStart={(e) => {
          // Touch event registered to enhance mobile responsiveness
          e.currentTarget.style.backgroundColor = isActive ? "#D7FF0030" : "#2A2B3190";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.backgroundColor = isActive ? "#D7FF0020" : "transparent";
          handleClick(e);
        }}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: '50px', // Increase height for better touch targets
          cursor: 'pointer'
        }}
        className={`flex items-center px-4 py-4 rounded-lg transition-colors duration-200 ${
          isActive ? "bg-[#D7FF00]/10 text-[#D7FF00]" : "text-white hover:bg-[#2A2B31] active:bg-[#2A2B31]/80"
        } ${isTitle || isHome ? "text-base font-bold" : "text-sm"}`}
      >
        {label}
      </div>
    </Link>
  );
});

type MobileNavigationProps = {
  user: SelectUser | null | undefined;
  isAuthenticated: boolean;
  handleLogout: () => Promise<void>;
  setOpenMobile?: (open: boolean) => void; // Optional to maintain backward compatibility
  openMobile?: boolean; // Control open state from parent (added for Header.tsx)
};

export function MobileNavigation({ 
  user, 
  isAuthenticated,
  handleLogout,
  setOpenMobile: externalSetOpenMobile,
  openMobile: externalOpenMobile
}: MobileNavigationProps) {
  // If external setter is provided, use it; otherwise use internal state
  const [internalOpenMobile, setInternalOpenMobile] = useState(false);
  const setOpenMobile = externalSetOpenMobile || setInternalOpenMobile;
  // Use externally provided openMobile value if available, otherwise use internal state
  const openMobile = externalOpenMobile !== undefined ? externalOpenMobile : internalOpenMobile;

  return (
    <div className="md:hidden relative overflow-hidden group">
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-12 w-12 md:h-12 md:w-12 flex items-center justify-center transform transition-all duration-300 hover:scale-110"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Add dummy handler to ensure touch events register properly
            }}
          >
            <Menu className="h-8 w-8 text-white hover:text-[#D7FF00] transition-colors duration-300" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          style={{
            touchAction: 'pan-y', // Allow vertical scrolling
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            overscrollBehavior: 'contain', // Prevent pull-to-refresh
            userSelect: 'none', // Prevent unwanted text selection
            zIndex: 100 // Ensure it's above other elements
          }}
          className="w-[300px] bg-[#14151A] border-r border-[#2A2B31] overflow-y-auto p-0"
        >
          <div className="flex flex-col gap-4 pt-8">
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
              label={
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
              } 
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
              {/* Authentication section */}
              {!user && (
                <div onClick={() => setOpenMobile(false)}>
                  <AuthSection 
                    user={undefined} /* Force undefined instead of null/undefined to match type */
                    handleLogout={handleLogout} 
                    isMobile={true} 
                    onMobileAction={() => setOpenMobile(false)}
                  />
                </div>
              )}

              <Button
                onClick={() => {
                  setOpenMobile(false);
                  window.open("https://www.goated.com/r/SPIN", "_blank");
                }}
                className="w-full bg-[#D7FF00] text-[#14151A] hover:bg-[#D7FF00]/90 transition-colors font-bold group"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  minHeight: '50px' // Larger touch target
                }}
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

              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    minHeight: '50px' // Larger touch target
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default React.memo(MobileNavigation);
