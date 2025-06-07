import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

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
  
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onClose();
    
    // Handle external links
    if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };
  
  const content = (
    <motion.div
      whileTap={{ scale: 0.98 }}
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
    </motion.div>
  );

  // For external links, don't use wouter Link
  if (isExternal) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}); 