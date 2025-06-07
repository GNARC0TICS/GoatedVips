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
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 max-w-xs opacity-0 group-hover:opacity-100 text-[#D7FF00] text-sm text-center transition-all duration-300 bg-[#1A1B21] p-3 rounded-lg shadow-lg border border-[#D7FF00]/20 z-10 pointer-events-none
                         sm:bottom-full sm:mb-2
                         xs:top-full xs:bottom-auto xs:mt-2">
            Use code VIPBOOST when signing up to instantly join our VIP program
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1A1B21]
                           sm:top-full sm:bottom-auto
                           xs:bottom-full xs:top-auto xs:border-t-0 xs:border-b-4 xs:border-b-[#1A1B21]"></div>
          </div>
        </div>
      </a>
    </motion.div>
  );
} 