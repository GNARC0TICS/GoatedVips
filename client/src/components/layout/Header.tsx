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
      {/* Mobile Layout - Completely separate from desktop */}
      <div className="md:hidden h-14 px-3 flex items-center justify-between relative">
        <MobileSearchDropdown isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
        
        {/* Mobile Left: Hamburger Menu */}
        <div className="flex-shrink-0">
          <MobileNavigation 
            user={user} 
            isAuthenticated={isAuthenticated} 
            handleLogout={handleLogout}
            setOpenMobile={setOpenMobile}
            openMobile={openMobile}
          />
        </div>

        {/* Mobile Center: Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center">
            <img 
              src="/images/Goated Logo - Yellow.png" 
              alt="GOATED" 
              className="h-5 w-auto object-contain"
              loading="eager"
              width="auto"
              height="20"
            />
          </Link>
        </div>

        {/* Mobile Right: Essential Actions Only */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open search"
            className="h-8 w-8 flex items-center justify-center rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSearchOpen(!mobileSearchOpen);
            }}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <Search className="h-4 w-4 text-[#D7FF00]" />
          </Button>

          {/* Utility Panel - Contains all quick actions */}
          <UtilityPanelButton />

          {/* Mobile Auth Section - Priority display */}
          <AuthSection 
            user={user} 
            handleLogout={handleLogout} 
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <nav className="hidden md:flex h-16 px-3 lg:px-6 items-center justify-between max-w-7xl mx-auto relative">
        {/* Desktop Left: Logo */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/" className="flex items-center">
            <img 
              src="/images/logo-neon.png" 
              alt="GOATED" 
              className="h-6 lg:h-7 w-auto object-contain"
              loading="eager"
              width="auto"
              height="28"
            />
          </Link>
          <div className="h-8 lg:h-10 border-r border-[#2A2B31] ml-2" />
        </div>

        {/* Desktop Center: Navigation */}
        <div className="flex items-center justify-center flex-1 max-w-2xl">
          <DesktopNavLinks isAuthenticated={isAuthenticated} />
        </div>

        {/* Desktop Right: Actions + Auth */}
        <div className="flex items-center gap-2 min-w-0">
          <UserSearch />

          {/* Quick action buttons */}
          <div className="flex items-center gap-1">
            <Link href="/crypto-swap">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Crypto Swap"
                className="text-[#D7FF00] h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <CryptoSwapIcon className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="https://t.me/xGoombas" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Join Telegram Community"
                className="text-[#D7FF00] h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <TelegramIcon className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/wager-races">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wager Races"
                className="text-[#D7FF00] h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <WagerRacesIcon className="w-4 h-4" />
              </Button>
            </Link>
            
            <UtilityPanelButton />
          </div>

          {/* Admin menu and Auth section */}
          <div className="flex items-center gap-2">
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