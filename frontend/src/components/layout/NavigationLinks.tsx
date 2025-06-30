import React, { useMemo, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, ChevronDown, Sparkles } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNavigationSections } from "@/data/navigationData";

// Import any assets needed
import giftIcon from '/images/GIFT.png';

// --- NavLink Component ---
type NavLinkProps = {
  href: string;
  label: string | React.ReactNode;
  tooltip?: string;
};

export const NavLink = React.memo(function NavLink({ href, label, tooltip }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const [isHovered, setIsHovered] = useState(false);

  const linkContent = (
    <motion.div
      className={`relative font-heading cursor-pointer px-3 py-2 rounded-lg transition-all duration-300 ${
        isActive ? "text-[#D7FF00] bg-[#D7FF00]/10" : "text-white hover:bg-[#D7FF00]/5"
      } hover:text-[#D7FF00]`}
      whileHover={{ 
        scale: 1.05,
        y: -1,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <span className="relative z-10 font-bold tracking-wide">{label}</span>
      
      {/* Enhanced Active/Hover Indicator */}
      <motion.div
        className="absolute -bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-[#D7FF00] to-[#B8E000] origin-center rounded-full"
        initial={{ scaleX: isActive ? 1 : 0, x: "-50%" }}
        animate={{ scaleX: isActive ? 1 : 0, x: "-50%" }}
        whileHover={{ scaleX: 1, x: "-50%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      {/* Enhanced Glow Effect */}
      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/10 to-[#D7FF00]/5 rounded-lg -z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      
      {/* Sparkle Effect for Active State */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-3 w-3 text-[#D7FF00]" />
        </motion.div>
      )}
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

type DesktopNavLinksProps = {
  isAuthenticated: boolean;
};

export function DesktopNavLinks({ isAuthenticated }: DesktopNavLinksProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Memoized navigation sections for performance
  const navigationSections = useMemo(() => 
    getNavigationSections(false), 
    []
  );

  // Memoized main sections filter
  const mainSections = useMemo(() => 
    navigationSections.filter(section => 
      ['events', 'get-started', 'promotions', 'leaderboards'].includes(section.id)
    ),
    [navigationSections]
  );

  const handleDropdownChange = useCallback((sectionId: string, open: boolean) => {
    setOpenDropdown(open ? sectionId : null);
  }, []);

  const renderDropdownItem = useCallback((item: any, itemIndex: number, onSelect?: () => void) => {
    const label = typeof item.label === 'function' 
      ? item.label({ isAuthenticated }) 
      : item.label;

    if (item.requiresAuth && !isAuthenticated) {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: itemIndex * 0.05 }}
        >
          <DropdownMenuItem className="opacity-50 cursor-not-allowed hover:bg-red-500/10" disabled>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2 w-full">
                  <span>Bonus Codes</span>
                  <Lock className="h-4 w-4 text-red-400" />
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-red-900 border-red-700">
                  <p>Sign in to access bonus codes and rewards</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuItem>
        </motion.div>
      );
    }

    if (item.isExternal) {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: itemIndex * 0.05 }}
          whileHover={{ x: 4 }}
        >
          <DropdownMenuItem 
            className="hover:bg-[#D7FF00]/10 hover:text-[#D7FF00] transition-colors cursor-pointer group"
            onSelect={() => {
              window.open(item.href, "_blank", "noopener,noreferrer");
              onSelect?.();
            }}
          >
            <div className="flex items-center justify-between w-full">
              <span>{label}</span>
              <svg
                className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </DropdownMenuItem>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: itemIndex * 0.05 }}
        whileHover={{ x: 4 }}
      >
        <DropdownMenuItem asChild className="hover:bg-[#D7FF00]/10 hover:text-[#D7FF00] transition-colors cursor-pointer">
          <Link href={item.href} onClick={onSelect} className="w-full">
            {label}
          </Link>
        </DropdownMenuItem>
      </motion.div>
    );
  }, [isAuthenticated]);

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NavLink href="/" label="HOME" />
      </motion.div>
      
      {mainSections.map((section, sectionIndex) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sectionIndex + 1) * 0.1, duration: 0.3 }}
        >
          <DropdownMenu 
            open={openDropdown === section.id}
            onOpenChange={(open) => handleDropdownChange(section.id, open)}
          >
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-all duration-300 hover:bg-[#D7FF00]/10 px-3 py-2 rounded-lg ${
                    openDropdown === section.id ? 'bg-[#D7FF00]/10 text-[#D7FF00]' : ''
                  }`}
                  aria-expanded={openDropdown === section.id}
                  aria-haspopup="true"
                >
                  <span className="font-bold tracking-wide">{section.title}</span>
                  <motion.div
                    animate={{ rotate: openDropdown === section.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {openDropdown === section.id && (
                <DropdownMenuContent 
                  className="w-64 bg-gradient-to-b from-[#1A1B21] to-[#15161C] border-[#2A2B31] text-white shadow-2xl shadow-black/50 backdrop-blur-xl"
                  align="start"
                  sideOffset={8}
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="p-2 space-y-1">
                      {/* Enhanced Section Header */}
                      <div className="px-3 py-2 border-b border-[#2A2B31]/50 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-6 bg-gradient-to-r from-[#D7FF00] to-[#B8E000] rounded-full" />
                          <span className="text-xs font-bold text-[#D7FF00] tracking-wider">
                            {section.title}
                          </span>
                        </div>
                      </div>
                      
                      {/* Enhanced Menu Items */}
                      {section.items.map((item, itemIndex) => 
                        renderDropdownItem(item, itemIndex, () => setOpenDropdown(null))
                      )}
                    </div>
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>
      ))}
    </div>
  );
}

export { DesktopNavLinks as NavigationLinks };

// Enhanced performance with proper memoization
export default React.memo(DesktopNavLinks, (prevProps, nextProps) => {
  return prevProps.isAuthenticated === nextProps.isAuthenticated;
});
