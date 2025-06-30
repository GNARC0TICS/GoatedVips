import React, { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isScrolled, setIsScrolled] = useState(false);

  // Enhanced scroll detection for dynamic header styling
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Optimized callbacks
  const handleMobileMenuToggle = useCallback((open: boolean) => {
    setOpenMobile(open);
  }, []);

  const handleMobileSearchToggle = useCallback((open: boolean) => {
    setMobileSearchOpen(open);
  }, []);

  // Memoized quick action buttons
  const quickActionButtons = useMemo(() => (
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
  ), []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#14151A]/98 backdrop-blur-2xl border-b border-[#2A2B31]/80 shadow-2xl shadow-[#000000]/20' 
          : 'bg-[#14151A]/95 backdrop-blur-xl border-b border-[#2A2B31]/50'
      } supports-[backdrop-filter]:bg-[#14151A]/80`}
    >
      {/* Mobile Layout - Enhanced responsive design */}
      <motion.div 
        className="md:hidden h-14 px-3 flex items-center justify-between relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <AnimatePresence>
          {mobileSearchOpen && (
            <MobileSearchDropdown 
              isOpen={mobileSearchOpen} 
              onClose={() => handleMobileSearchToggle(false)} 
            />
          )}
        </AnimatePresence>

        {/* Mobile Left: Enhanced Hamburger Menu */}
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MobileNavigation 
            user={user} 
            isAuthenticated={isAuthenticated} 
            handleLogout={handleLogout}
            setOpenMobile={handleMobileMenuToggle}
            openMobile={openMobile}
          />
        </motion.div>

        {/* Mobile Center: Enhanced Logo */}
        <motion.div 
          className="flex-1 flex justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/" className="flex items-center">
            <motion.img 
              src="/images/Goated Logo - Yellow.png" 
              alt="GOATED" 
              className="h-5 w-auto object-contain transition-all duration-300 hover:brightness-110"
              loading="eager"
              width="auto"
              height="20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
          </Link>
        </motion.div>

        {/* Mobile Right: Enhanced Actions */}
        <motion.div 
          className="flex items-center gap-1 flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {/* Enhanced Mobile Search Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open search"
              className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                mobileSearchOpen ? 'bg-[#D7FF00]/20 text-[#D7FF00]' : 'hover:bg-[#D7FF00]/10'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleMobileSearchToggle(!mobileSearchOpen);
              }}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <motion.div
                animate={{ rotate: mobileSearchOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-4 w-4 text-[#D7FF00]" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Enhanced Utility Panel */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <UtilityPanelButton />
          </motion.div>

          {/* Enhanced Mobile Auth Section */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <AuthSection 
              user={user} 
              handleLogout={handleLogout} 
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Desktop Layout */}
      <motion.nav 
        className="hidden md:flex h-16 px-3 lg:px-6 items-center justify-between max-w-7xl mx-auto relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Enhanced Desktop Left: Logo */}
        <motion.div 
          className="flex items-center gap-2 min-w-0 flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="flex items-center">
              <motion.img 
                src="/images/logo-neon.png" 
                alt="GOATED" 
                className="h-6 lg:h-7 w-auto object-contain transition-all duration-300 hover:brightness-110 hover:drop-shadow-[0_0_8px_rgba(215,255,0,0.3)]"
                loading="eager"
                width="auto"
                height="28"
                whileHover={{ 
                  filter: "brightness(1.2) drop-shadow(0 0 12px rgba(215,255,0,0.4))"
                }}
              />
            </Link>
          </motion.div>
          <motion.div 
            className="h-8 lg:h-10 border-r border-[#2A2B31] ml-2 transition-colors duration-300"
            animate={{
              borderColor: isScrolled ? "rgba(42, 43, 49, 0.8)" : "rgba(42, 43, 49, 0.5)"
            }}
          />
        </motion.div>

        {/* Enhanced Desktop Center: Navigation */}
        <motion.div 
          className="flex items-center justify-center flex-1 max-w-2xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <DesktopNavLinks isAuthenticated={isAuthenticated} />
        </motion.div>

        {/* Enhanced Desktop Right: Actions + Auth */}
        <motion.div 
          className="flex items-center gap-2 min-w-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="hidden lg:block"
          >
            <UserSearch />
          </motion.div>

          {/* Enhanced Quick action buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {quickActionButtons}
          </motion.div>

          {/* Enhanced Admin menu and Auth section */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            {user?.isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AdminMenu />
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <AuthSection 
                user={user} 
                handleLogout={handleLogout} 
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.nav>
    </motion.header>
  );
}

export default Header;