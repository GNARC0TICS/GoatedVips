
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CryptoSwapWidgetProps {
  className?: string;
  fullWidth?: boolean;
}

export function CryptoSwapWidget({ className = '', fullWidth = false }: CryptoSwapWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Ensure dark mode is always applied
  useEffect(() => {
    // Give iframe some time to load, then ensure dark mode
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        // Send a message to iframe to enforce dark mode if possible
        try {
          iframeRef.current.contentWindow?.postMessage({ theme: 'dark' }, '*');
        } catch (e) {
          console.error('Unable to communicate with iframe:', e);
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Card className={`border-[#D7FF00]/10 bg-[#1A1C23]/90 backdrop-blur-sm shadow-xl shadow-black/20 ${className}`}>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <iframe 
          ref={iframeRef}
          src="https://nanswap.com/iframe-swap/swap?defaultFrom=XNO&defaultTo=BAN&mode=swap&invitationId=69308334955&theme=dark&borderRadius=16&hidePoweredBy=true&hideExtra=true" 
          style={{ 
            width: fullWidth ? '100%' : '500px', 
            height: '500px', 
            background: 'transparent', 
            border: 'none',
            borderRadius: '16px'
          }} 
          title="Crypto Swap Widget"
        />
      </CardContent>
    </Card>
  );
}
