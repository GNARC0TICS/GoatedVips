import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  linkText?: string;
  badge?: {
    text: string;
    color?: string;
  };
  isLocked?: boolean;
  lockMessage?: string;
  authRequired?: boolean;
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  linkText = "Learn More",
  badge,
  isLocked = false,
  lockMessage = "Sign in to access",
  authRequired = false,
}: FeatureCardProps) {
  // Wrap with link only if it's a direct link that doesn't require authentication
  const CardWrapper = ({ children }: { children: ReactNode }) => {
    if (isLocked || !href) {
      return <>{children}</>;
    }
    return <Link href={href} className="block w-full">{children}</Link>;
  };

  return (
    <CardWrapper>
      <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
        <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between">
          <div className="flex items-start mb-4">
            {icon}
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-2xl font-heading uppercase text-white">
              {title}
            </h3>
            {badge && (
              <span className={`text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full`}>
                {badge.text}
              </span>
            )}
          </div>
          <p className="text-[#8A8B91] mb-6 font-body text-center">
            {description}
          </p>
          <div className="mt-auto">
            {isLocked ? (
              <span className="font-heading text-[#8A8B91] inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
                {lockMessage}
              </span>
            ) : (
              <motion.span 
                className="font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors cursor-pointer"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {linkText} <ArrowRight className="h-4 w-4" />
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}

export default React.memo(FeatureCard);
