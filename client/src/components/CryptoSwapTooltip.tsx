import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CryptoSwapTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if we've already shown the tooltip in this session
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem('hasSeenCryptoSwapTooltip');
    
    if (!hasSeenTooltip) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
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
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="relative bg-[#1A1C23] border border-[#D7FF00]/40 p-4 rounded-xl shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        
        <div className="mb-3">
          <div className="font-bold text-[#D7FF00] text-lg mb-1">🔄 New Feature: Crypto Swap</div>
          <p className="text-gray-300 text-sm mb-4">
            Try our new crypto swap feature! Easy exchange between your favorite cryptocurrencies.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDismiss}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Maybe Later
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-[#D7FF00] hover:bg-[#D7FF00]/90 text-black"
            asChild
          >
            <Link href="/crypto-swap" onClick={handleDismiss}>
              Try Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}