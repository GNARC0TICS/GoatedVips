import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface FeatureSectionProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FeatureSection({
  title = "EXPLORE OUR FEATURES",
  icon = <Zap className="w-8 h-8 text-[#D7FF00] animate-flicker" />,
  children,
  className = "",
}: FeatureSectionProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`mb-24 ${className}`}
    >
      <h2 className="text-4xl font-heading text-white mb-12 text-center flex items-center justify-center gap-3">
        {icon}
        {title}
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto px-4"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export interface FeatureSectionContainerProps {
  children: ReactNode;
  className?: string;
}

export function FeatureSectionContainer({
  children,
  className = "",
}: FeatureSectionContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`grid md:grid-cols-3 gap-6 mb-20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default React.memo(FeatureSection);
