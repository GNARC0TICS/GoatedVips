
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { MessageCircle, Send, Ticket } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Performance: Memoized icon component
const InventoryIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 32 32"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 24h4v4h-4zm7 0h4v4h-4zm-7-7h4v4h-4zm7 0h4v4h-4z" />
    <path d="M17 24H4V10h24v5h2v-5a2 2 0 0 0-2-2h-6V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13ZM12 4h8v4h-8Z" />
  </svg>
);

// Utility panel items configuration
const PANEL_ITEMS = [
  {
    id: 'daily-spin',
    label: 'Daily Spin',
    icon: InventoryIcon,
    route: '/wheel-challenge',
    ariaLabel: 'Access daily spin wheel'
  },
  {
    id: 'bonus-codes',
    label: 'Bonus Codes',
    icon: Ticket,
    route: '/bonus-codes',
    ariaLabel: 'View available bonus codes'
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: Send,
    href: 'https://t.me/+2dFGi_rMDodjMmZh',
    ariaLabel: 'Join our Telegram community'
  },
  {
    id: 'support',
    label: 'Support',
    icon: MessageCircle,
    href: 'https://t.me/xGoombas',
    ariaLabel: 'Contact support team'
  }
] as const;

// Animation variants - performance optimized
const mobileVariants = {
  hidden: { 
    height: 0, 
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  visible: { 
    height: 'auto', 
    opacity: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const itemVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

// Shared styles - preventing inline style recreation
const mobileButtonStyles = {
  touchAction: 'manipulation' as const,
  WebkitTapHighlightColor: 'transparent'
};

export const UtilityPanelButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Performance: Memoized handlers
  const handleClose = useCallback(() => setIsOpen(false), []);
  
  const handleNavigation = useCallback((route: string) => {
    setLocation(route);
    handleClose();
  }, [setLocation, handleClose]);

  const PanelItem = ({ item }: { item: typeof PANEL_ITEMS[number] }) => {
    const IconComponent = item.icon;
    const isExternal = 'href' in item;
    
    const baseClasses = "flex flex-col items-center justify-center gap-2 p-4 bg-[#2A2B31]/60 rounded-xl min-h-[60px] md:min-h-[80px] border border-transparent hover:border-[#D7FF00]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D7FF00]/50 focus:ring-offset-2 focus:ring-offset-[#1A1B21]";
    
    if (isExternal) {
      return (
        <motion.a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClose}
          className={baseClasses}
          style={isMobile ? mobileButtonStyles : undefined}
          variants={itemVariants}
          whileTap={{ scale: 0.95 }}
          aria-label={item.ariaLabel}
        >
          <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-[#D7FF00]" />
          <span className="text-xs md:text-sm text-[#8A8B91] font-medium text-center">
            {item.label}
          </span>
        </motion.a>
      );
    }

    return (
      <motion.button
        onClick={() => handleNavigation(item.route)}
        className={baseClasses}
        style={isMobile ? mobileButtonStyles : undefined}
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
        aria-label={item.ariaLabel}
      >
        <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-[#D7FF00]" />
        <span className="text-xs md:text-sm text-[#8A8B91] font-medium text-center">
          {item.label}
        </span>
      </motion.button>
    );
  };

  const MobilePanel = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={mobileVariants}
      className="fixed inset-x-0 bg-[#1A1B21]/95 backdrop-blur-xl border-b border-[#2A2B31] z-[90] shadow-lg"
      style={{ top: '3.5rem' }}
    >
      <div className="container mx-auto px-4 py-4 max-w-md">
        <motion.div 
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {PANEL_ITEMS.map((item) => (
            <PanelItem key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  const DesktopPanel = () => (
    <DropdownMenuContent
      align="end"
      className="w-[320px] border border-[#2A2B31] bg-[#1A1B21]/95 backdrop-blur-xl p-4 mt-2 shadow-xl"
      sideOffset={8}
    >
      <motion.div 
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {PANEL_ITEMS.map((item) => (
          <PanelItem key={item.id} item={item} />
        ))}
      </motion.div>
    </DropdownMenuContent>
  );

  // Fixed: Remove button nesting by using div as trigger for mobile
  if (isMobile) {
    return (
      <>
        <motion.div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className="relative h-10 w-10 flex items-center justify-center rounded-md hover:bg-[#2A2B31]/60 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D7FF00]/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle utility panel"
          aria-expanded={isOpen}
        >
          <InventoryIcon className="h-5 w-5 text-[#D7FF00]" />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {isOpen && <MobilePanel />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="relative h-10 w-10 flex items-center justify-center rounded-md hover:bg-[#2A2B31]/60 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D7FF00]/50"
          aria-label="Open utility panel"
        >
          <InventoryIcon className="h-5 w-5 text-[#D7FF00]" />
        </div>
      </DropdownMenuTrigger>
      <DesktopPanel />
    </DropdownMenu>
  );
};
