import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CryptoSwapWidgetProps {
  className?: string;
  fullWidth?: boolean;
}

export function CryptoSwapWidget({ className = '', fullWidth = false }: CryptoSwapWidgetProps) {
  return (
    <Card className={`border-[#D7FF00]/20 bg-[#1A1C23] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-[#D7FF00]">
          Crypto Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden rounded-b-lg">
        <iframe 
          src="https://nanswap.com/iframe-swap/swap?defaultFrom=XNO&defaultTo=BAN&mode=swap&invitationId=69308334955&theme=dark&borderRadius=16&hidePoweredBy=true&hideExtra=true" 
          style={{ 
            width: fullWidth ? '100%' : '500px', 
            height: '500px', 
            background: 'transparent', 
            border: 'none',
            borderRadius: '0 0 16px 16px'
          }} 
          title="Crypto Swap Widget"
        />
      </CardContent>
    </Card>
  );
}