import { motion } from "framer-motion";
import { Gift } from "lucide-react";

export function PromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }} // Adjusted delay/duration from original
      className="mb-8"
    >
      <a
        href="https://www.Goated.com/r/VIPBOOST"
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="bg-[#D7FF00]/10 border border-[#D7FF00] rounded-lg p-4 mx-auto max-w-md backdrop-blur-sm relative transition-all duration-300 hover:bg-[#D7FF00]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#D7FF00] animate-pulse" />
              <span className="text-white font-heading">
                NEW USER PROMO:
              </span>
            </div>
            <div className="bg-[#D7FF00] px-3 py-1 rounded font-mono text-black font-bold tracking-wider">
              VIPBOOST
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 text-[#D7FF00] text-sm text-center transition-all duration-300 bg-[#1A1B21] p-2 rounded-lg">
            Use code VIPBOOST when signing up to instantly join our VIP program
          </div>
        </div>
      </a>
    </motion.div>
  );
} 