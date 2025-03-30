import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Repeat } from 'lucide-react';
import { Link } from 'wouter';

export function CryptoSwapHomeWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="border-[#D7FF00]/20 bg-[#1A1C23] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-[#D7FF00] flex items-center">
            <Repeat className="mr-2 h-5 w-5" /> Crypto Swap
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white p-1 h-8"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded ? (
        <CardContent className="p-0">
          <iframe 
            src="https://nanswap.com/iframe-swap/swap?defaultFrom=XNO&defaultTo=BAN&mode=swap&invitationId=69308334955&theme=dark&borderRadius=16&hidePoweredBy=true&hideExtra=true" 
            style={{ 
              width: '100%', 
              height: '450px', 
              background: 'transparent', 
              border: 'none'
            }} 
            title="Crypto Swap Widget"
          />
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-gray-300 text-sm">
            Quickly swap between cryptocurrencies with our integrated exchange service.
            Supports XNO, BAN and many other popular tokens.
          </p>
        </CardContent>
      )}
      
      <CardFooter className="pt-2 pb-3">
        <Button 
          variant="default" 
          className="bg-[#D7FF00] hover:bg-[#D7FF00]/90 text-black"
          asChild
        >
          <Link href="/crypto-swap" className="flex items-center">
            Open Full Exchange <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}