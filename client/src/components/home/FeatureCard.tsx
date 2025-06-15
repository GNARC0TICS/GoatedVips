import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FeatureCardData } from '@/data/homeFeatures';
import { getIcon } from '@/lib/iconMap';

interface FeatureCardProps {
  feature: FeatureCardData;
  isAuthenticated: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isAuthenticated }) => {
  const {
    id,
    iconName,
    customIconComponent: CustomIcon,
    iconProps,
    title,
    description,
    link,
    requiresAuth,
    authSensitiveLink,
    badgeText: rawBadgeText,
    badgeType: rawBadgeType,
    ctaText: rawCtaText,
    ctaLink,
    ctaRequiresAuthAction,
  } = feature;

  const IconComponent = CustomIcon || getIcon(iconName);

  const currentDescription = typeof description === 'function' ? description(isAuthenticated) : description;
  const currentBadgeText = rawBadgeText && typeof rawBadgeText === 'function' ? rawBadgeText(isAuthenticated) : rawBadgeText;
  const currentBadgeType = rawBadgeType && typeof rawBadgeType === 'function' ? rawBadgeType(isAuthenticated) : rawBadgeType;
  const currentCtaText = typeof rawCtaText === 'function' ? rawCtaText(isAuthenticated) : rawCtaText;

  const isLocked = requiresAuth && !isAuthenticated;
  const effectiveLink = isLocked && authSensitiveLink ? '#' : link;
  const showTooltipForCard = isLocked && authSensitiveLink;

  const renderBadge = () => {
    if (!currentBadgeText) return null;

    let badgeClasses = "text-xs font-heading px-2 py-1 bg-[#D7FF00]/10 rounded-full";
    // Potentially add more badge type styling here if needed
    // e.g., if (currentBadgeType === 'LIVE') badgeClasses += " text-red-500";

    return (
      <span className={badgeClasses}>
        {currentBadgeText}
      </span>
    );
  };

  const CardContent = () => (
    <div 
      className="relative group transform transition-all duration-300 hover:scale-[1.02] min-h-[280px] w-full cursor-pointer"
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
      <div className="relative p-6 md:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 card-hover h-full w-full flex flex-col justify-between"
        style={{
          minHeight: '280px',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {IconComponent && (
          <div className="flex items-start mb-4">
            <IconComponent {...iconProps} />
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-2xl font-heading uppercase text-white">{title}</h3>
          {isLocked && !authSensitiveLink && <Lock className="h-4 w-4 text-[#8A8B91]" />}
          {renderBadge()}
        </div>
        <p className="text-[#8A8B91] mb-6 font-body text-center flex-grow">
          {currentDescription}
        </p>
        <div className="mt-auto">
          {(!isLocked || !ctaRequiresAuthAction) && (
            <span className={`font-heading text-[#D7FF00] inline-flex items-center gap-2 hover:text-[#D7FF00]/80 transition-colors ${effectiveLink === '#' || (isLocked && authSensitiveLink) ? 'opacity-50 cursor-not-allowed' :'cursor-pointer'}`}>
              {currentCtaText} {effectiveLink !== '#' && <ArrowRight className="h-4 w-4" />}
            </span>
          )}
          {isLocked && ctaRequiresAuthAction && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <span className="font-heading text-[#8A8B91] inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                    <Lock className="h-4 w-4" />
                    {currentCtaText}
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

  if (showTooltipForCard) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger 
            className="block w-full h-full text-left min-h-[280px] touch-target"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <CardContent />
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in to access {title.toLowerCase()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If the card itself is a link (most cases)
  if (effectiveLink !== '#') {
    return (
      <Link 
        href={effectiveLink} 
        className="block w-full h-full min-h-[280px] touch-target"
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none'
        }}
      >
        <CardContent />
      </Link>
    );
  }

  // If the card is not a link (e.g. locked and authSensitiveLink is true, but no separate tooltip needed for whole card)
  // This case might be for cards that are purely display when locked, or CTA handles interaction
  return <CardContent />;

}; 