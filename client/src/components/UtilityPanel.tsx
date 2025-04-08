import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { MessageCircle, Send, Ticket } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom Gift Icon component using the provided SVG
const GiftIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
    className={className}
    fill="none"
  >
    <path 
      d="M20 12V22H4V12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M22 7H2V12H22V7Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 22V7" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const UtilityPanelButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const MobilePanel = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-x-0 top-16 bg-[#1A1B21] border-b border-[#2A2B31]"
    >
      <div className="grid grid-cols-2 gap-3 p-4">
        <motion.button
          onClick={() => {
            setLocation("/wheel-challenge");
            setIsOpen(false);
          }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#2A2B31]/60 rounded-xl"
        >
          <GiftIcon className="w-8 h-8 text-[#D7FF00]" />
          <span className="text-xs text-[#8A8B91]">Daily Spin</span>
        </motion.button>

        <motion.button
          onClick={() => {
            setLocation("/bonus-codes");
            setIsOpen(false);
          }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#2A2B31]/60 rounded-xl"
        >
          <Ticket className="w-8 h-8 text-[#D7FF00]" />
          <span className="text-xs text-[#8A8B91]">Bonus Codes</span>
        </motion.button>

        <motion.a
          href="https://t.me/+bnV67QwFmCFlMGFh"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#2A2B31]/60 rounded-xl"
          onClick={() => setIsOpen(false)}
        >
          <Send className="w-8 h-8 text-[#D7FF00]" />
          <span className="text-xs text-[#8A8B91]">Telegram</span>
        </motion.a>

        <motion.a
          href="https://t.me/xGoombas"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#2A2B31]/60 rounded-xl"
          onClick={() => setIsOpen(false)}
        >
          <MessageCircle className="w-8 h-8 text-[#D7FF00]" />
          <span className="text-xs text-[#8A8B91]">Support</span>
        </motion.a>
      </div>
    </motion.div>
  );

  const DesktopPanel = () => (
    <DropdownMenuContent
      align="end"
      className="w-[320px] border border-[#2A2B31] bg-[#1A1B21]/95 backdrop-blur-xl p-4 mt-2"
    >
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={() => {
            setLocation("/wheel-challenge");
            setIsOpen(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="aspect-square p-4 bg-[#2A2B31]/80 backdrop-blur-sm rounded-xl border border-[#2A2B31]/50 hover:bg-[#2A2B31]/90 transition-all relative group flex flex-col items-center justify-between"
        >
          <div className="flex-1 flex items-center justify-center">
            <GiftIcon className="w-10 h-10 text-[#D7FF00] drop-shadow-[0_0_8px_rgba(215,255,0,0.3)]" />
          </div>
          <span className="text-xs text-[#8A8B91] font-medium text-center">Daily Spin</span>
        </motion.button>

        <motion.button
          onClick={() => {
            setLocation("/bonus-codes");
            setIsOpen(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="aspect-square p-4 bg-[#2A2B31]/80 backdrop-blur-sm rounded-xl border border-[#2A2B31]/50 hover:bg-[#2A2B31]/90 transition-all group flex flex-col items-center justify-between"
        >
          <div className="flex-1 flex items-center justify-center">
            <Ticket className="w-10 h-10 text-[#D7FF00] drop-shadow-[0_0_8px_rgba(215,255,0,0.3)]" />
          </div>
          <span className="text-xs text-[#8A8B91] font-medium text-center">Bonus Codes</span>
        </motion.button>

        <motion.a
          href="https://t.me/+bnV67QwFmCFlMGFh"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="aspect-square p-4 bg-[#2A2B31]/80 backdrop-blur-sm rounded-xl border border-[#2A2B31]/50 hover:bg-[#2A2B31]/90 transition-all group flex flex-col items-center justify-between"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex-1 flex items-center justify-center">
            <Send className="w-10 h-10 text-[#D7FF00] drop-shadow-[0_0_8px_rgba(215,255,0,0.3)]" />
          </div>
          <span className="text-xs text-[#8A8B91] font-medium text-center">Telegram</span>
        </motion.a>

        <motion.a
          href="https://t.me/xGoombas"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="aspect-square p-4 bg-[#2A2B31]/80 backdrop-blur-sm rounded-xl border border-[#2A2B31]/50 hover:bg-[#2A2B31]/90 transition-all group flex flex-col items-center justify-between"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex-1 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-[#D7FF00] drop-shadow-[0_0_8px_rgba(215,255,0,0.3)]" />
          </div>
          <span className="text-xs text-[#8A8B91] font-medium text-center">Support</span>
        </motion.a>
      </div>
    </DropdownMenuContent>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="relative h-8 w-8 hover:bg-[#D7FF00]/10 focus:outline-none"
          >
            <GiftIcon className="h-5 w-5 text-white hover:text-[#D7FF00]" />
          </Button>
          {isOpen && <MobilePanel />}
        </>
      ) : (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 hover:bg-[#D7FF00]/10 focus:outline-none"
            >
              <GiftIcon className="h-5 w-5 text-white hover:text-[#D7FF00]" />
            </Button>
          </DropdownMenuTrigger>
          <DesktopPanel />
        </DropdownMenu>
      )}
    </>
  );
};