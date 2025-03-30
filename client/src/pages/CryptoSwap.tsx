
import React, { useState, useEffect } from 'react';
import { CryptoSwapWidget } from '@/components/CryptoSwapWidget';
import { Layout } from '@/components/Layout';
import { Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function CryptoSwap() {
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false after timeout to ensure widget has time to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="relative container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        {/* Background gradient effects with increased opacity */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D7FF00]/10 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D7FF00]/10 rounded-full blur-[100px] -z-10" />
        </div>
        
        <div className="bg-[#1A1C23]/40 backdrop-blur-md border border-[#2A2B31]/50 rounded-xl shadow-2xl overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Repeat className="h-8 w-8 text-[#D7FF00]" />
              <h1 className="text-3xl md:text-4xl font-bold text-white font-heading">Crypto Exchange</h1>
            </div>
            <p className="text-gray-300 mb-6 text-lg">
              Easily swap between cryptocurrencies with our secure integration. Fast, convenient, and reliable exchanges at competitive rates.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full p-4 md:p-6 relative"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1C23]/80 backdrop-blur-sm z-10 rounded-xl">
                <Loader2 className="h-12 w-12 text-[#D7FF00] animate-spin" />
              </div>
            )}
            <CryptoSwapWidget fullWidth />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-xl text-white mb-4 font-bold">Why use our Crypto Swap?</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#1A1C23]/50 backdrop-blur-sm border border-[#2A2B31] p-5 rounded-xl">
              <h3 className="text-[#D7FF00] font-bold mb-2">Secure</h3>
              <p className="text-sm text-gray-300">Built with industry-leading security practices to keep your assets safe.</p>
            </div>
            <div className="bg-[#1A1C23]/50 backdrop-blur-sm border border-[#2A2B31] p-5 rounded-xl">
              <h3 className="text-[#D7FF00] font-bold mb-2">Fast</h3>
              <p className="text-sm text-gray-300">Quick transactions with minimal waiting time for your swaps.</p>
            </div>
            <div className="bg-[#1A1C23]/50 backdrop-blur-sm border border-[#2A2B31] p-5 rounded-xl">
              <h3 className="text-[#D7FF00] font-bold mb-2">Low Fees</h3>
              <p className="text-sm text-gray-300">Competitive rates designed to maximize your value on every trade.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
