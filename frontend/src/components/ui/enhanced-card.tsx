import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { patterns } from "@/lib/design-system";

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated' | 'magical';
  hoverGlow?: boolean;
  animateIn?: boolean;
  delay?: number;
  children: React.ReactNode;
}

const cardVariants = {
  default: patterns.card.base,
  interactive: `${patterns.card.base} ${patterns.card.interactive}`,
  elevated: `${patterns.card.base} ${patterns.card.elevated}`,
  magical: `${patterns.card.base} ${patterns.card.interactive} ${patterns.card.elevated} group/card relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-[#D7FF00]/0 before:via-[#D7FF00]/20 before:to-[#D7FF00]/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:animate-pulse`
};

const magicalEffects = {
  shimmer: `after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-1000 after:ease-out`,
  glow: `before:absolute before:inset-0 before:rounded-xl before:bg-[#D7FF00]/20 before:blur-xl before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`,
  float: `hover:translate-y-[-4px] transition-transform duration-300 ease-out`,
  rotate: `hover:rotate-1 transition-transform duration-300 ease-out`,
  scale: `hover:scale-[1.02] transition-transform duration-200 ease-out`,
};

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant = 'default', 
    hoverGlow = false,
    animateIn = false,
    delay = 0,
    children,
    onClick,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [hasBeenVisible, setHasBeenVisible] = React.useState(!animateIn);
    const cardRef = React.useRef<HTMLDivElement>(null);

    // Intersection observer for animation trigger
    React.useEffect(() => {
      if (!animateIn || hasBeenVisible) return;

      let timeoutId: NodeJS.Timeout | null = null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timeoutId = setTimeout(() => {
              setHasBeenVisible(true);
            }, delay);
          }
        },
        { threshold: 0.1 }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => {
        observer.disconnect();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [animateIn, hasBeenVisible, delay]);

    const isClickable = typeof onClick === 'function';
    
    const combinedStyles = {
      ...(isClickable ? {
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none' as const
      } : {}),
      ...props.style
    };

    const cardContent = (
      <div
        ref={cardRef}
        className={cn(
          cardVariants[variant],
          hoverGlow && magicalEffects.glow,
          variant === 'magical' && [
            magicalEffects.shimmer,
            magicalEffects.float,
          ],
          isClickable && "cursor-pointer",
          className
        )}
        style={combinedStyles}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Magical background gradient */}
        {variant === 'magical' && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#D7FF00]/5 via-transparent to-[#D7FF00]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Content container */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Hover sparkles effect */}
        {variant === 'magical' && isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#D7FF00] rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  y: [null, '-20px'],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </div>
    );

    if (animateIn) {
      return (
        <AnimatePresence>
          {hasBeenVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94], // Magic ease curve
              }}
            >
              {cardContent}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

    return cardContent;
  }
);

EnhancedCard.displayName = "EnhancedCard";

// Enhanced Card Header with better typography hierarchy
export const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withDivider?: boolean }
>(({ className, withDivider = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-3 p-6",
      withDivider && "border-b border-[#2A2B31]/50",
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

// Enhanced Card Title with better typography
export const EnhancedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    size?: 'sm' | 'md' | 'lg' | 'xl';
    gradient?: boolean;
  }
>(({ className, size = 'md', gradient = false, ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "font-heading font-semibold leading-tight tracking-tight",
        sizeClasses[size],
        gradient 
          ? "bg-gradient-to-r from-white to-[#D7FF00] bg-clip-text text-transparent"
          : "text-white",
        className
      )}
      {...props}
    />
  );
});
EnhancedCardTitle.displayName = "EnhancedCardTitle";

// Enhanced Card Description with better typography
export const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'default' | 'muted' | 'accent';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'text-[#8A8B91]',
    muted: 'text-[#525252]',
    accent: 'text-[#D7FF00]/80'
  };

  return (
    <p
      ref={ref}
      className={cn(
        "text-sm leading-relaxed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
EnhancedCardDescription.displayName = "EnhancedCardDescription";

// Enhanced Card Content with better spacing
export const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 space-y-4", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

// Enhanced Card Footer with better layout
export const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withDivider?: boolean;
    justifyContent?: 'start' | 'center' | 'end' | 'between';
  }
>(({ className, withDivider = false, justifyContent = 'start', ...props }, ref) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center', 
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0 space-x-2",
        withDivider && "border-t border-[#2A2B31]/50 pt-6",
        justifyClasses[justifyContent],
        className
      )}
      {...props}
    />
  );
});
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export { 
  EnhancedCard as Card,
  EnhancedCardHeader as CardHeader,
  EnhancedCardTitle as CardTitle,
  EnhancedCardDescription as CardDescription,
  EnhancedCardContent as CardContent,
  EnhancedCardFooter as CardFooter
}; 