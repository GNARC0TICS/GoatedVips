import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ fullscreen = true, size = "md" }: LoadingSpinnerProps) {
  // Memoize the size classes for performance
  const sizeClasses = useMemo(
    () => ({
      sm: "h-8 w-8",
      md: "h-12 w-12",
      lg: "h-16 w-16",
    }),
    []
  );

  // Define variants for our animations
  const containerVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const gemVariants = {
    animate: {
      rotate: 360,
      scale: [1, 1.1, 1],
      transition: {
        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
      },
    },
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.2 } },
  };

  const lineVariants = {
    initial: { width: 0 },
    animate: { width: 120, transition: { duration: 1, repeat: Infinity } },
  };

  // Define the Content component
  const Content = () => (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col items-center">
      <motion.div
        variants={gemVariants}
        className="relative mb-4"
        style={{ willChange: "transform" }}
      >
        <Gem className={`${sizeClasses[size]} text-[#D7FF00]`} />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 blur-lg bg-[#D7FF00]/30 rounded-full"
          style={{ willChange: "opacity" }}
        />
      </motion.div>

      <motion.h2 variants={textVariants} className="text-xl font-heading font-bold text-[#D7FF00] mb-2">
        Loading
      </motion.h2>
      <motion.div
        variants={lineVariants}
        className="h-0.5 bg-[#D7FF00]/50 rounded-full"
        style={{ willChange: "width" }}
      />
    </motion.div>
  );

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-[4px] z-50 flex flex-col items-center justify-center"
        style={{ willChange: "opacity" }}
      >
        <Content />
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Content />
    </div>
  );
}
