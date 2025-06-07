import React, { useState } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "../auth/AuthModal";
import type { SelectUser } from "@db/schema";
import { UserSearch } from "../interactive/UserSearch";
import { UtilityPanelButton } from "../utils/UtilityPanel";
import { AdminMenu } from "./AdminMenu";
import { UserMenu } from "./UserMenu";
import { MobileNavigation } from "./MobileNavigation";
import { MobileSearchDropdown } from "../interactive/MobileSearchDropdown";
import { DesktopNavLinks } from "./NavigationLinks";
import { AuthSection } from "../auth/AuthSection";
import { CryptoSwapIcon, TelegramIcon, WagerRacesIcon } from "@/components/icons/HeaderIcons";

type HeaderProps = {
  isAuthenticated: boolean;
  user: SelectUser | undefined;
  handleLogout: () => Promise<void>;
};

export function Header({ isAuthenticated, user, handleLogout }: HeaderProps) {
  const [openMobile, setOpenMobile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#14151A]/95 backdrop-blur-xl border-b border-[#2A2B31]/50 supports-[backdrop-filter]:bg-[#14151A]/80">
      <nav className="h-14 sm:h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between max-w-7xl mx-auto relative">
        <MobileSearchDropdown isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
        
        {/* Left section - Mobile menu + Logo */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 z-10">
          {/* Mobile menu button */}
          <div className="md:hidden relative z-20">
            <MobileNavigation 
              user={user} 
              isAuthenticated={isAuthenticated} 
              handleLogout={handleLogout}
              setOpenMobile={setOpenMobile}
              openMobile={openMobile}
            />
          </div>
          
          {/* Logo with improved mobile sizing */}
          <Link href="/" className="flex items-center min-w-0">
            <div className="flex items-center justify-center overflow-hidden">
              <img 
                src="/images/logo-neon.png" 
                alt="GOATED" 
                className="hidden md:block h-6 lg:h-7 w-auto object-contain"
                loading="eager"
                width="auto"
                height="28"
              />
              <img 
                src="/images/Goated Logo - Yellow.png" 
                alt="GOATED" 
                className="block md:hidden h-5 sm:h-6 w-auto object-contain"
                loading="eager"
                width="auto"
                height="24"
              />
            </div>
          </Link>
          
          {/* Vertical divider */}
          <div className="hidden sm:block h-8 md:h-10 border-r border-[#2A2B31] ml-2" />
        </div>

        {/* Center section - Desktop Navigation (hidden on mobile) */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl">
          <DesktopNavLinks isAuthenticated={isAuthenticated} />
        </div>

        {/* Right section - Actions + Auth */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 relative z-10">
          {/* Search - Desktop visible, Mobile as icon */}
          <div className="hidden md:block">
            <UserSearch />
          </div>
          
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open search"
            className="md:hidden h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-lg relative z-30 min-h-[44px] min-w-[44px]"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSearchOpen(!mobileSearchOpen);
            }}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#D7FF00]" />
          </Button>

          {/* Quick action buttons - Optimized for mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link href="/crypto-swap">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Crypto Swap"
                className="text-[#D7FF00] h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <CryptoSwapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            
            <Link href="https://t.me/xGoombas" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Join Telegram Community"
                className="text-[#D7FF00] h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <TelegramIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            
            <Link href="/wager-races">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wager Races"
                className="text-[#D7FF00] h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <WagerRacesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            
            <UtilityPanelButton />
          </div>

          {/* Admin menu and Auth section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user?.isAdmin && <AdminMenu />}
            <AuthSection 
              user={user} 
              handleLogout={handleLogout} 
            />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;