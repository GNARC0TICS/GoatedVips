import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, ChevronDown } from "lucide-react";
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

type DesktopNavLinksProps = {
  isAuthenticated: boolean;
};

export function DesktopNavLinks({ isAuthenticated }: DesktopNavLinksProps) {
  const navigationSections = getNavigationSections(false); // Don't include admin sections in main navigation

  // Filter sections that should appear in the main navigation
  const mainSections = navigationSections.filter(section => 
    ['events', 'get-started', 'promotions', 'leaderboards'].includes(section.id)
  );

  const renderDropdownItem = (item: any, onSelect?: () => void) => {
    const label = typeof item.label === 'function' 
      ? item.label({ isAuthenticated }) 
      : item.label;

    if (item.requiresAuth && !isAuthenticated) {
      return (
        <DropdownMenuItem key={item.id} className="opacity-50 cursor-not-allowed" disabled>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2 w-full">
                <span>Bonus Codes</span>
                <Lock className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sign in to access bonus codes and rewards</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuItem>
      );
    }

    if (item.isExternal) {
      return (
        <DropdownMenuItem 
          key={item.id} 
          onSelect={() => {
            window.open(item.href, "_blank", "noopener,noreferrer");
            onSelect?.();
          }}
        >
          {label}
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem key={item.id} asChild>
        <Link href={item.href} onClick={onSelect}>
          {label}
        </Link>
      </DropdownMenuItem>
    );
  };

  return (
    <>
      <NavLink href="/" label="HOME" />
      
      {mainSections.map((section) => (
        <DropdownMenu key={section.id}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1 font-heading text-white hover:text-[#D7FF00] transition-colors duration-300 hover:bg-transparent px-2"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <span className="font-bold">{section.title}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 bg-[#1A1B21] border-[#2A2B31] text-white"
            align="start"
            sideOffset={5}
          >
            {section.items.map((item) => renderDropdownItem(item))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </>
  );
}

export { DesktopNavLinks as NavigationLinks };
