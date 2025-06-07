import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#D7FF00] relative mt-auto">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent pointer-events-none" />
      
      {/* Main footer content */}
      <div className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Mobile-first responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16">
            
            {/* Left Column - CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h4 className="font-heading text-[#14151A] text-xl sm:text-2xl lg:text-3xl font-bold">
                  Ready to get Goated?
                </h4>
                <a
                  href="https://www.goated.com/r/VIPBOOST"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-[#14151A]/10 transition-all duration-300 hover:bg-[#14151A]/20 hover:scale-110 active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <img
                    src="/images/Goated Logo - Black.png"
                    alt="Goated"
                    className="h-6 w-auto sm:h-5 lg:h-6"
                  />
                </a>
              </div>
              
              <p className="text-[#14151A] text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
                Sign up now and enjoy additional rewards from our side. Start
                your journey to becoming a casino legend!
              </p>
              
              <Button
                onClick={() =>
                  window.open("https://www.goated.com/r/EARLYACCESS", "_blank")
                }
                className="w-full sm:w-auto bg-[#14151A] text-white hover:bg-[#14151A]/90 transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-lg"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  minHeight: '48px'
                }}
              >
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Sign Up Now
              </Button>
            </div>
            
            {/* Right Column - Newsletter Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h4 className="font-heading text-[#14151A] text-xl sm:text-2xl lg:text-3xl font-bold">
                  Stay Updated
                </h4>
                <a
                  href="https://t.me/+iFlHl5V9VcszZTVh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <img
                    src="/images/Goated logo with text.png"
                    alt="Goated"
                    className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                  />
                </a>
              </div>
              
              <p className="text-[#14151A] text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
                Subscribe to our newsletter for exclusive offers, updates, and VIP rewards!
              </p>
              
              {/* Enhanced newsletter form */}
              <form 
                onSubmit={(e) => e.preventDefault()} 
                className="flex flex-col sm:flex-row gap-3 sm:gap-2"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#14151A]/60" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-[#14151A]/20 focus:outline-none focus:ring-2 focus:ring-[#14151A] focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    style={{ 
                      fontSize: '16px', // Prevent iOS zoom
                      minHeight: '48px' // Touch target
                    }}
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto bg-[#14151A] text-white hover:bg-[#14151A]/90 transition-all duration-300 hover:scale-105 active:scale-95 font-bold px-6 py-3 sm:py-2"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    minHeight: '48px'
                  }}
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Bottom bar with logos and legal */}
        <div className="bg-[#14151A] text-[#8A8B91] border-t border-[#2A2B31]/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Partner logos */}
            <div className="flex flex-col items-center gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12">
                <a
                  href="https://www.goated.com/r/VIPBOOST"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <img
                    src="/images/Goated logo with text.png"
                    alt="Goated"
                    className="h-10 sm:h-12 lg:h-14 w-auto object-contain max-w-[200px] sm:max-w-[250px]"
                  />
                </a>
                <a
                  href="https://t.me/+iFlHl5V9VcszZTVh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <img
                    src="/images/Goated logo with text1.png"
                    alt="Goated Partner"
                    className="h-10 sm:h-12 lg:h-14 w-auto object-contain max-w-[200px] sm:max-w-[250px]"
                  />
                </a>
              </div>
            </div>
            
            {/* Legal text with improved mobile formatting */}
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base font-medium">
                © {new Date().getFullYear()} GoatedVips.gg. All rights reserved.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#8A8B91]/80">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure Platform</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>18+ Only</span>
                <span className="hidden sm:inline">•</span>
                <span>Gamble Responsibly</span>
              </div>
              
              <p className="text-xs sm:text-sm text-[#8A8B91]/70 leading-relaxed max-w-3xl mx-auto">
                <strong>Disclaimer:</strong> This website is an independent platform and is not affiliated with, 
                endorsed by, or officially connected to Goated.com. Please visit 
                <a 
                  href="https://www.begambleaware.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#D7FF00] hover:underline ml-1"
                >
                  BeGambleAware.org
                </a> for responsible gambling resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
