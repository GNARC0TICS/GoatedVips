
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CryptoSwapWidgetProps {
  className?: string;
  fullWidth?: boolean;
}

export function CryptoSwapWidget({ className = '', fullWidth = false }: CryptoSwapWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    // Give a short delay to ensure dark mode is applied
    setTimeout(() => {
      setIsIframeLoaded(true);
      
      // Ensure dark mode is applied
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage({ theme: 'dark' }, '*');
        } catch (e) {
          console.error('Unable to communicate with iframe:', e);
        }
      }
    }, 500);
  };
  
  // Periodically check and enforce dark mode
  useEffect(() => {
    const enforceDarkMode = () => {
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage({ theme: 'dark' }, '*');
        } catch (e) {
          console.error('Unable to enforce dark mode:', e);
        }
      }
    };
    
    // Initial enforcement
    enforceDarkMode();
    
    // Set up interval for periodic checks
    const interval = setInterval(enforceDarkMode, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className={`border-[#D7FF00]/10 bg-[#1A1C23]/90 backdrop-blur-sm shadow-xl shadow-black/20 ${className} overflow-hidden`}>
      <CardContent className="p-0 relative">
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1C23] z-10">
            <Loader2 className="h-8 w-8 text-[#D7FF00] animate-spin" />
          </div>
        )}
        <iframe 
          ref={iframeRef}
          src="https://nanswap.com/iframe-swap/swap?defaultFrom=XNO&defaultTo=BAN&mode=swap&invitationId=69308334955&theme=dark&borderRadius=16&hidePoweredBy=true&hideExtra=true" 
          onLoad={handleIframeLoad}
          style={{ 
            width: '100%', 
            height: '500px', 
            background: '#1A1C23', 
            border: 'none',
            borderRadius: '16px',
            opacity: isIframeLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }} 
          title="Crypto Swap Widget"
        />
      </CardContent>
    </Card>
  );
}
