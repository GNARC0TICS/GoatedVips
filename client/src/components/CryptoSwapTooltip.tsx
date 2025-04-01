
import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function CryptoSwapTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ bottom: 6, left: 6 });
  
  // Check if we've already shown the tooltip in this session
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem('hasSeenCryptoSwapTooltip');
    
    if (!hasSeenTooltip) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        
        // Check if RaceTimer exists and adjust position accordingly
        const raceTimer = document.querySelector('[data-component="race-timer"]');
        if (raceTimer) {
          const raceTimerRect = raceTimer.getBoundingClientRect();
          // If the RaceTimer is at the bottom-right, shift the crypto tooltip to the left
          if (raceTimerRect.right > window.innerWidth - 100 && raceTimerRect.bottom > window.innerHeight - 100) {
            setPosition({ bottom: 100, left: 6 });
          }
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    // Remember that user has seen the tooltip
    sessionStorage.setItem('hasSeenCryptoSwapTooltip', 'true');
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed z-40 max-w-sm" style={{ bottom: `${position.bottom}px`, left: `${position.left}px` }}>
      <div className="relative bg-[#1A1C23]/60 backdrop-blur-md border border-[#D7FF00]/30 p-4 rounded-xl shadow-lg shadow-[#D7FF00]/10">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        
        <div className="mb-3">
          <div className="font-bold text-[#D7FF00] text-lg mb-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-[#D7FF00]">
              <path fill="currentColor" d="M9 12.5L6.5 15L9 17.5l2.5-2.5zm6-10a6.5 6.5 0 0 0-6.482 6.018a6.5 6.5 0 1 0 6.964 6.964A6.5 6.5 0 0 0 15 2.5m.323 10.989a6.51 6.51 0 0 0-4.812-4.812a4.5 4.5 0 1 1 4.812 4.812M13.5 15a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M3 7a4 4 0 0 1 4-4h1.5v2H7a2 2 0 0 0-2 2v1.5H3zm16 10v-1.5h2V17a4 4 0 0 1-4 4h-1.5v-2H17a2 2 0 0 0 2-2" />
            </svg>
            New Feature: Crypto Swap
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Try our new crypto swap feature! Easy exchange between your favorite cryptocurrencies.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDismiss}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm"
          >
            Maybe Later
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-[#D7FF00] hover:bg-[#D7FF00]/90 text-black flex items-center gap-1"
            asChild
          >
            <Link href="/crypto-swap" onClick={handleDismiss}>
              Try Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
