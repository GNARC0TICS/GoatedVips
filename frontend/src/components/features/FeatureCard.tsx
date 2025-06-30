import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeatureCardProps {
  title: string;
  description: string | ((isAuthenticated: boolean) => string);
  icon: ReactNode;
  href: string;
  linkText?: string | ((isAuthenticated: boolean) => string);
  badge?: {
    text: string | ((isAuthenticated: boolean) => string);
    type?: string | ((isAuthenticated: boolean) => string);
    color?: string;
  };
  isLocked?: boolean;
  lockMessage?: string;
  authRequired?: boolean;
  isAuthenticated?: boolean;
  ctaRequiresAuthAction?: boolean;
  authSensitiveLink?: boolean;
  enhanced?: boolean; // Use enhanced styling
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
  isAuthenticated = false,
  ctaRequiresAuthAction = false,
  authSensitiveLink = false,
  enhanced = false,
}: FeatureCardProps) {
  // Resolve dynamic props
  const currentDescription = typeof description === 'function' ? description(isAuthenticated) : description;
  const currentLinkText = typeof linkText === 'function' ? linkText(isAuthenticated) : linkText;
  const currentBadgeText = badge?.text && typeof badge.text === 'function' ? badge.text(isAuthenticated) : badge?.text;
  
  // Determine final locked state
  const finalIsLocked = isLocked || (authRequired && !isAuthenticated);
  const effectiveHref = finalIsLocked && authSensitiveLink ? '#' : href;
  const showTooltipForCard = finalIsLocked && authSensitiveLink;

  const renderBadge = () => {
    if (!currentBadgeText) return null;
    return (
      <span className="text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full">
        {currentBadgeText}
      </span>
    );
  };

  const CardContent = () => (
    <div className={`relative group transform transition-all duration-${enhanced ? '200' : '300'} hover:scale-[1.02] ${enhanced ? 'hover:translate-y-[-4px] min-h-[320px]' : ''} w-full cursor-pointer`}>
      {/* Enhanced glow effects for enhanced mode */}
      {enhanced ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#D7FF00]/10 via-[#D7FF00]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
      )}
      
      <div className={`relative p-${enhanced ? '8' : '6 md:p-8'} rounded-xl border border-[#2A2B31] bg-[#1A1B21]/${enhanced ? '60' : '50'} backdrop-blur-${enhanced ? 'md' : 'sm'} hover:border-[#D7FF00]/${enhanced ? '60' : '50'} transition-all duration-${enhanced ? '200' : '300'} shadow-lg ${enhanced ? 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_40px_rgba(215,255,0,0.15)]' : 'hover:shadow-[#FFD700]/20'} h-full w-full flex flex-col justify-between`}>
        
        <div className="flex items-start mb-4">
          {icon}
        </div>
        
        <div className="flex ${enhanced ? 'flex-col' : ''} items-center justify-center gap-${enhanced ? '3' : '2'} mb-${enhanced ? '6' : '4'}">
          <h3 className={`text-2xl font-heading uppercase text-white ${enhanced ? 'text-center leading-tight tracking-wide group-hover:text-[#D7FF00] transition-colors duration-200' : ''}`}>
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {finalIsLocked && !authSensitiveLink && <Lock className="h-4 w-4 text-[#8A8B91]" />}
            {renderBadge()}
          </div>
        </div>
        
        <p className={`text-[#8A8B91] mb-${enhanced ? '8' : '6'} font-body text-center ${enhanced ? 'flex-grow leading-relaxed text-sm' : ''}`}>
          {currentDescription}
        </p>
        
        <div className="mt-auto">
          {(!finalIsLocked || !ctaRequiresAuthAction) && (
            <motion.span 
              className={`font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors ${effectiveHref === '#' || (finalIsLocked && authSensitiveLink) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={!enhanced ? { x: 5 } : undefined}
              transition={!enhanced ? { type: "spring", stiffness: 300 } : undefined}
            >
              {currentLinkText} {effectiveHref !== '#' && <ArrowRight className="h-4 w-4" />}
            </motion.span>
          )}
          
          {finalIsLocked && ctaRequiresAuthAction && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <span className="font-heading text-[#8A8B91] inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                    <Lock className="h-4 w-4" />
                    {currentLinkText}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign in to access {title.toLowerCase()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );

  // Handle different wrapper types
  if (showTooltipForCard) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="block w-full h-full text-left">
            <CardContent />
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in to access {title.toLowerCase()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (effectiveHref !== '#' && !finalIsLocked) {
    return (
      <Link href={effectiveHref} className="block w-full">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}

export default React.memo(FeatureCard);
