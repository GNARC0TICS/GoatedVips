import React from "react";

/**
 * CallToAction
 * Renders the bottom call-to-action button/section.
 * Mobile-first responsive design with enhanced visual appeal and accessibility.
 * DESIGN AGENT: Style the button, add animation, and polish as per final design.
 * - Replace text, background, and effects as needed.
 */
const CallToAction: React.FC = () => {
  return (
    <section className="w-full py-8 sm:py-12 lg:py-16">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        {/* Enhanced heading section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-3 sm:mb-4">
            READY TO <span className="text-[#D7FF00]">BECOME A GOAT?</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#8A8B91] max-w-2xl mx-auto leading-relaxed">
            Join thousands of players earning rewards through our exclusive VIP program. 
            Use code VIPBOOST to get instant access.
          </p>
        </div>
        
        {/* Mobile-optimized CTA button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <a
            href="https://www.Goated.com/r/VIPBOOST"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center w-full sm:w-auto"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            {/* Main button */}
            <div className="relative bg-[#D7FF00] text-black font-heading font-bold text-base sm:text-lg lg:text-xl px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(215,255,0,0.5)] group-active:scale-95 overflow-hidden min-h-[48px] sm:min-h-[56px] lg:min-h-[64px]">
              
              {/* Button content */}
              <span className="relative z-10 flex items-center justify-center gap-2">
                JOIN THE GOATS TODAY!
                <span className="text-lg sm:text-xl" role="img" aria-label="goat">🐐</span>
              </span>
              
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00] via-[#E5FF33] to-[#D7FF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out skew-x-12"></div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#D7FF00] rounded-lg sm:rounded-xl opacity-20 blur-lg scale-110 group-hover:opacity-40 group-hover:scale-125 transition-all duration-300"></div>
          </a>
          
          {/* Secondary info */}
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-[#8A8B91] font-medium">
              Free to join • Instant VIP Access
            </p>
            <p className="text-xs text-[#D7FF00] font-bold mt-1">
              Use code: VIPBOOST
            </p>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-[#2A2B31]/50">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-[#8A8B91]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>5,000+ Active Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D7FF00] rounded-full"></div>
              <span>Trusted Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 