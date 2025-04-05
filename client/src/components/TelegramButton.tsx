import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TelegramIcon } from "./icons/TelegramIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TelegramButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TelegramButton: React.FC<TelegramButtonProps> = ({
  className = "",
  size = "md",
}) => {
  // Define size mappings
  const sizeMap = {
    sm: {
      button: "h-8 w-8",
      icon: 18,
    },
    md: {
      button: "h-9 w-9",
      icon: 20,
    },
    lg: {
      button: "h-10 w-10",
      icon: 22,
    },
  };

  const telegram_url = "https://t.me/+bnV67QwFmCFlMGFh";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={className}
          >
            <a
              href={telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`relative ${sizeMap[size].button} hover:bg-[#D7FF00]/10 focus:outline-none group`}
              >
                <TelegramIcon 
                  size={sizeMap[size].icon} 
                  className="text-white group-hover:text-[#D7FF00] transition-colors" 
                />
              </Button>
            </a>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent sideOffset={5} className="bg-[#1A1B21] border-[#2A2B31] text-white">
          <p>Join our Telegram</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TelegramButton;