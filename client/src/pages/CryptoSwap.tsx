import React from 'react';
import { CryptoSwapWidget } from '@/components/CryptoSwapWidget';
import { Layout } from '@/components/Layout';

export default function CryptoSwap() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#D7FF00] mb-6">Crypto Swap</h1>
        <p className="text-gray-300 mb-8">
          Easily swap between cryptocurrencies with our integration. Fast, secure, and convenient.
        </p>
        
        <div className="flex justify-center w-full">
          <CryptoSwapWidget fullWidth />
        </div>
      </div>
    </Layout>
  );
}