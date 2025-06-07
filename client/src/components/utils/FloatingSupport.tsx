import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-6 z-50 w-80 bg-[#1A1B21] rounded-xl shadow-xl border border-[#2A2B31]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-[#2A2B31]">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-white">Support</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-[#2A2B31] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#8A8B91] mb-4">
                Need assistance? Our VIP support team is available 24/7.
              </p>
              <a
                href="https://t.me/xGoombas"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="default"
                  className="w-full bg-[#D7FF00] text-[#14151A] hover:bg-[#D7FF00]/90"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact on Telegram
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-3 bg-[#D7FF00] text-[#14151A] shadow-lg hover:bg-[#D7FF00]/90 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Support"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </>
  );
};