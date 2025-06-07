import React from "react";
import { Link } from "wouter";
import { IconMap } from "@/lib/iconMap";
import { Lock } from "lucide-react";

/**
 * FeatureCard
 * Renders a single feature card for the home page grid.
 * Mobile-first responsive design with enhanced touch targets and accessibility.
 * DESIGN AGENT: Style the card, icon, badge, and hover effects as per final design.
 * - Add animation, gradients, or effects as needed.
 * - Ensure accessibility and keyboard navigation.
 */
export interface FeatureCardProps {
  icon: keyof typeof IconMap;
  title: string;
  description: string;
  link: string;
  badge?: string;
  requiresAuth?: boolean;
  isAuthenticated?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  link,
  badge,
  requiresAuth,
  isAuthenticated,
}) => {
  const Icon = IconMap[icon];
  const isLocked = requiresAuth && !isAuthenticated;
  
  return (
    <Link 
      href={link} 
      className="block w-full"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <div className="relative group h-full">
        {/* Mobile-optimized card with better touch targets */}
        <div className={`
          relative p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl 
          border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm 
          h-full min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]
          flex flex-col transition-all duration-300
          ${isLocked 
            ? 'opacity-60 cursor-not-allowed' 
            : 'hover:scale-[1.02] hover:border-[#D7FF00]/30 hover:bg-[#1A1B21]/70 hover:shadow-[0_0_20px_rgba(215,255,0,0.1)] active:scale-[0.98]'
          }
        `}>
          
          {/* Icon and badge section */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
              {Icon && (
                <div className="p-2 rounded-lg bg-[#D7FF00]/10 border border-[#D7FF00]/20">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#D7FF00]" />
                </div>
              )}
            </div>
            
            {/* Badge and lock indicator */}
            <div className="flex items-center gap-2">
              {badge && (
                <span className="text-xs font-heading font-bold text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full border border-[#D7FF00]/20">
                  {badge}
                </span>
              )}
              {isLocked && (
                <div className="p-1 rounded bg-[#8A8B91]/20">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-[#8A8B91]" />
                </div>
              )}
            </div>
          </div>
          
          {/* Title section */}
          <div className="mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold uppercase text-white leading-tight">
              {title}
            </h3>
          </div>
          
          {/* Description section - flexible grow */}
          <div className="flex-1 flex items-start">
            <p className="text-xs sm:text-sm lg:text-base text-[#8A8B91] leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Bottom CTA section */}
          <div className="mt-4 pt-3 border-t border-[#2A2B31]/50">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#D7FF00] font-medium">
                {isLocked ? 'Sign in required' : 'Explore →'}
              </span>
              {!isLocked && (
                <div className="w-2 h-2 rounded-full bg-[#D7FF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </div>
          </div>
          
          {/* Hover gradient overlay */}
          {!isLocked && (
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-t from-[#D7FF00]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard; 