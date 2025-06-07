import React from "react";

/**
 * PromoBanner
 * Renders the new user promo banner with hover tooltip.
 * Mobile-first responsive design with improved touch targets and accessibility.
 * DESIGN AGENT: Style the banner, tooltip, and animation as per final design.
 * - Replace colors, borders, and font as needed.
 * - Add animation or effects for hover state.
 */
const PromoBanner: React.FC = () => {
  return (
    <a
      href="https://www.Goated.com/r/VIPBOOST"
      target="_blank"
      rel="noopener noreferrer"
      className="block group w-full"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <div className="bg-[#D7FF00]/10 border border-[#D7FF00] rounded-lg sm:rounded-xl p-4 sm:p-5 mx-auto max-w-sm sm:max-w-md md:max-w-lg backdrop-blur-sm relative transition-all duration-300 hover:bg-[#D7FF00]/20 hover:border-[#D7FF00]/80 hover:shadow-[0_0_20px_rgba(215,255,0,0.3)] active:scale-95">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {/* DESIGN AGENT: Replace with final icon */}
            <span className="text-white font-heading text-sm sm:text-base font-bold truncate">
              NEW USER PROMO:
            </span>
          </div>
          <div className="bg-[#D7FF00] px-3 py-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-mono text-black font-bold tracking-wider text-sm sm:text-base text-center shrink-0 shadow-lg transition-all duration-200 group-hover:bg-[#D7FF00]/90 group-active:scale-95">
            VIPBOOST
          </div>
        </div>
        
        {/* Enhanced tooltip for desktop */}
        <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 text-[#D7FF00] text-xs sm:text-sm text-center transition-all duration-300 bg-[#1A1B21] border border-[#2A2B31] p-2 sm:p-3 rounded-lg shadow-xl z-10 mx-2 pointer-events-none">
          <div className="font-medium">
            Use code VIPBOOST when signing up to instantly join our VIP program
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2A2B31]"></div>
        </div>
        
        {/* Mobile-friendly description (always visible on mobile) */}
        <div className="mt-3 sm:hidden text-xs text-[#8A8B91] text-center">
          Use code VIPBOOST when signing up for instant VIP access
        </div>
        
        {/* Pulse animation for emphasis */}
        <div className="absolute inset-0 rounded-lg border border-[#D7FF00] opacity-0 group-hover:opacity-30 animate-pulse pointer-events-none"></div>
      </div>
    </a>
  );
};

export default PromoBanner; 