import React, { useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, useAnimation } from "framer-motion";

export type MobileNavLinkProps = {
  href: string;
  label: string | React.ReactNode;
  onClose: () => void;
  isTitle?: boolean;
  isExternal?: boolean;
};

export const MobileNavLink = React.memo(function MobileNavLink({
  href,
  label,
  onClose,
  isTitle = false,
  isExternal = false,
}: MobileNavLinkProps) {
  const [location] = useLocation();
  const isActive = !isExternal && location === href;
  const isHome = href === "/";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();
  const [isTouched, setIsTouched] = React.useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleNavigation = useCallback(async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Enhanced haptic-style feedback
    await controls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3, ease: "easeInOut" }
    });
    
    // Handle external links immediately
    if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // For internal navigation, delay menu close until after navigation
    timeoutRef.current = setTimeout(() => {
      onClose();
      timeoutRef.current = null;
    }, 200);
  }, [controls, isExternal, href, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsTouched(true);
    // Enhanced touch feedback with better visual response
    const target = e.currentTarget as HTMLElement;
    target.style.backgroundColor = isActive 
      ? "rgba(215, 255, 0, 0.15)" 
      : "rgba(42, 43, 49, 0.8)";
    target.style.transform = "scale(0.98)";
  }, [isActive]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setIsTouched(false);
    // Reset touch feedback with smooth transition
    const target = e.currentTarget as HTMLElement;
    target.style.backgroundColor = isActive 
      ? "rgba(215, 255, 0, 0.1)" 
      : "transparent";
    target.style.transform = "scale(1)";
    target.style.transition = "all 0.2s ease-out";
  }, [isActive]);
  
  const content = (
    <motion.div
      animate={controls}
      whileHover={{ 
        scale: 1.02,
        x: 6,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleNavigation}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        minHeight: '52px',
        cursor: 'pointer'
      }}
      className={`group relative flex items-center px-4 py-4 mx-2 rounded-xl transition-all duration-300 overflow-hidden ${
        isActive 
          ? "bg-gradient-to-r from-[#D7FF00]/15 to-[#D7FF00]/5 text-[#D7FF00] shadow-lg shadow-[#D7FF00]/10 border border-[#D7FF00]/20" 
          : "text-white hover:bg-gradient-to-r hover:from-[#2A2B31]/80 hover:to-[#2A2B31]/40 hover:shadow-lg hover:shadow-black/10 border border-transparent hover:border-[#2A2B31]/50"
      } ${isTitle || isHome ? "text-base font-bold" : "text-sm font-medium"}`}
    >
      {/* Enhanced Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D7FF00] to-[#B8E000] rounded-r-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      {/* Enhanced Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
      
      {/* Content with enhanced typography */}
      <motion.div 
        className="relative z-10 flex items-center gap-3 w-full"
        animate={isTouched ? { x: 2 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Enhanced label with better spacing */}
        <span className={`flex-1 ${
          isTitle || isHome 
            ? "text-base font-bold tracking-wide" 
            : "text-sm font-medium"
        }`}>
          {label}
        </span>
        
        {/* Enhanced External Link Indicator */}
        {isExternal && (
          <motion.svg
            className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 45 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </motion.svg>
        )}
        
        {/* Enhanced Active Arrow */}
        {isActive && !isExternal && (
          <motion.svg
            className="h-4 w-4 text-[#D7FF00]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </motion.svg>
        )}
      </motion.div>
    </motion.div>
  );

  // For external links, don't use wouter Link
  if (isExternal) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}, (prevProps, nextProps) => {
  return (
    prevProps.href === nextProps.href &&
    prevProps.label === nextProps.label &&
    prevProps.isTitle === nextProps.isTitle &&
    prevProps.isExternal === nextProps.isExternal
  );
});