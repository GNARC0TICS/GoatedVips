import React, { useState } from "react";
import { Link } from "wouter";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AuthModal from "../auth/AuthModal";
import type { SelectUser } from "@db/schema";
import { UserSearch } from "../interactive/UserSearch";
import { UtilityPanelButton } from "../utils/UtilityPanel";
import { headerClasses, dropdownClasses } from "@/lib/style-constants";
import { AdminMenu } from "./AdminMenu";
import { UserMenu } from "./UserMenu";
import { MobileNavigation } from "./MobileNavigation";
import { MobileSearchDropdown } from "../interactive/MobileSearchDropdown";
import { DesktopNavLinks } from "./NavigationLinks";
import { AuthSection } from "../auth/AuthSection";

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
      <nav className="h-14 sm:h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between max-w-7xl mx-auto">
        <MobileSearchDropdown isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
        
        {/* Left section - Mobile menu + Logo */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          {/* Mobile menu button */}
          <div className="md:hidden">
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
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Search - Desktop visible, Mobile as icon */}
          <div className="hidden md:block">
            <UserSearch />
          </div>
          
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg"
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
                className="text-[#D7FF00] h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="sm:w-5 sm:h-5"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.019 9A6.5 6.5 0 1 1 15 14.981" />
                  <path d="M8.5 22a6.5 6.5 0 1 1 0-13a6.5 6.5 0 0 1 0 13M22 17a3 3 0 0 1-3 3h-2m0 0l2-2m-2 2l2 2M2 7a3 3 0 0 1 3-3h2m0 0L5 6m2-2L5 2" />
                </svg>
              </Button>
            </Link>
            
            <Link href="https://t.me/xGoombas" target="_blank">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#D7FF00] h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 256 256"
                  className="sm:w-5 sm:h-5"
                  fill="currentColor"
                >
                  <path d="M228.88 26.19a9 9 0 0 0-9.16-1.57L17.06 103.93a14.22 14.22 0 0 0 2.43 27.21L72 141.45V200a15.92 15.92 0 0 0 10 14.83a15.91 15.91 0 0 0 17.51-3.73l25.32-26.26L165 220a15.88 15.88 0 0 0 10.51 4a16.3 16.3 0 0 0 5-.79a15.85 15.85 0 0 0 10.67-11.63L231.77 35a9 9 0 0 0-2.89-8.81M78.15 126.35l-49.61-9.73l139.2-54.48ZM88 200v-47.48l24.79 21.74Zm87.53 8l-82.68-72.5l119-85.29Z" />
                </svg>
              </Button>
            </Link>
            
            <Link href="/wager-races">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#D7FF00] h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#D7FF00]/10 hover:scale-105 active:scale-95"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 15 15"
                  className="sm:w-5 sm:h-5"
                  fill="currentColor"
                >
                  <path d="M4.993 1.582a.5.5 0 1 0-.986-.164l-2 12a.5.5 0 1 0 .986.164l.67-4.02c.806.118 1.677.157 2.363.638a3.3 3.3 0 0 0 1.432.583c.966.146 1.83-.385 2.784-.234l1.289.194c.26.04.53-.16.569-.42l.884-5.934l.004-.004a.52.52 0 0 0-.427-.564l-1.289-.194c-.963-.143-1.829.373-2.783.23A2.8 2.8 0 0 1 7.3 3.38c-.739-.517-1.619-.603-2.486-.725zm-.59 3.538l.33-1.972c.599.082 1.233.129 1.788.369l-.295 1.965c-.57-.233-1.213-.278-1.822-.362m-.658 3.95l.33-1.974c.62.086 1.277.13 1.858.368l.3-1.976c.658.27 1.159.733 1.893.841l.3-1.98c.738.111 1.349-.177 2.058-.234l-.3 1.966c-.71.06-1.324.36-2.06.25l-.286 1.978c-.736-.11-1.238-.575-1.899-.844l-.3 1.976c-.595-.239-1.263-.281-1.894-.371m4.094-.76c.734.11 1.351-.192 2.061-.251l.284-1.978c.655-.06 1.325.111 1.968.209l-.28 1.976c-.644-.097-1.316-.269-1.971-.207l-.3 1.976c-.709.048-1.335.36-2.062.25z" />
                </svg>
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