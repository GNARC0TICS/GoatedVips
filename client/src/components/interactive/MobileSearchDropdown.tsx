import React from "react";
import { Button } from "@/components/ui/button";
import { UserSearch } from "./UserSearch";
import { motion } from "framer-motion";

type MobileSearchDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileSearchDropdown({ isOpen, onClose }: MobileSearchDropdownProps) {
  return (
    <div
      id="mobile-search-dropdown"
      className={`md:hidden fixed left-0 right-0 bg-[#14151A] border-b border-[#2A2B31] transition-all duration-300 z-[100] ${
        isOpen ? 'h-16 opacity-100' : 'h-0 opacity-0 pointer-events-none'
      }`}
      style={{
        top: '3.5rem', // Align with h-14 header height (14 * 0.25rem)
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform, opacity',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none'
      }}
    >
      <div className="container mx-auto px-4 py-2 relative">
        <UserSearch isMobile={true} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onClose();
          }}
          style={{
            WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
            touchAction: 'manipulation' // Improve touch handling
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white hover:text-[#D7FF00] transition-colors duration-300"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default MobileSearchDropdown;
