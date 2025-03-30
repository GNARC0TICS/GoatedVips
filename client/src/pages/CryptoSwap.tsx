
import React, { useState, useEffect } from 'react';
import { CryptoSwapWidget } from '@/components/CryptoSwapWidget';
import { Layout } from '@/components/Layout';
import { Repeat, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="container mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-heading text-white mb-4 text-center uppercase">
            Crypto <span className="text-[#D7FF00]">Swap</span>
          </h1>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Quickly and securely exchange between cryptocurrencies with our integrated swap service.
          </p>
        </motion.div>
        
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
              <p className="text-sm text-gray-300">Competitive rates and minimal fees to maximize your exchange value.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
