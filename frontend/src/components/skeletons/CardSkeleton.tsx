import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  /**
   * Show header with title
   */
  withHeader?: boolean;
  
  /**
   * Show footer with actions
   */
  withFooter?: boolean;
  
  /**
   * Number of content items to render
   */
  contentItems?: number;
  
  /**
   * Additional classes to apply to the container
   */
  className?: string;
  
  /**
   * Variant for different card types
   */
  variant?: "default" | "feature" | "compact" | "hero";
  
  /**
   * Show icon placeholder
   */
  withIcon?: boolean;
  
  /**
   * Show badge placeholder
   */
  withBadge?: boolean;
}

/**
 * CardSkeleton component
 * A flexible skeleton loader for card-based UI components
 */
export function CardSkeleton({
  withHeader = true,
  withFooter = false,
  contentItems = 3,
  className,
  variant = "default",
  withIcon = false,
  withBadge = false,
}: CardSkeletonProps) {
  
  const getCardClasses = () => {
    const baseClasses = "relative rounded-lg sm:rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm";
    
    switch (variant) {
      case "feature":
        return cn(baseClasses, "p-4 sm:p-5 lg:p-6 min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]");
      case "compact":
        return cn(baseClasses, "p-3 sm:p-4 min-h-[120px] sm:min-h-[140px]");
      case "hero":
        return cn(baseClasses, "p-6 sm:p-8 lg:p-10 min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]");
      default:
        return cn(baseClasses, "p-4 sm:p-6 min-h-[150px] sm:min-h-[180px]");
    }
  };

  return (
    <div className={cn(getCardClasses(), className)}>
      {/* Header with icon and badge */}
      {withHeader && (
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            {withIcon && (
              <div className="p-2 rounded-lg bg-[#D7FF00]/10 border border-[#D7FF00]/20">
                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 bg-[#2A2B31]" />
              </div>
            )}
            <div className="flex-1">
              <Skeleton className="h-4 sm:h-5 lg:h-6 w-24 sm:w-32 lg:w-40 bg-[#2A2B31] mb-2" />
              {variant === "hero" && (
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 bg-[#2A2B31]" />
              )}
            </div>
          </div>
          
          {withBadge && (
            <Skeleton className="h-6 w-12 sm:w-16 bg-[#2A2B31] rounded-full" />
          )}
        </div>
      )}

      {/* Title area */}
      <div className="mb-3 sm:mb-4">
        <Skeleton className="h-5 sm:h-6 lg:h-7 w-full max-w-[80%] bg-[#2A2B31] mb-2" />
        {variant === "hero" && (
          <Skeleton className="h-4 sm:h-5 w-full max-w-[60%] bg-[#2A2B31]" />
        )}
      </div>

      {/* Content lines */}
      <div className="space-y-2 sm:space-y-3 flex-1">
        {Array.from({ length: contentItems }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              "h-3 sm:h-4 bg-[#2A2B31]",
              index === contentItems - 1 ? "w-[70%]" : "w-full"
            )}
          />
        ))}
      </div>

      {/* Footer */}
      {withFooter && (
        <div className="mt-4 pt-3 border-t border-[#2A2B31]/50 flex items-center justify-between">
          <Skeleton className="h-4 w-20 sm:w-24 bg-[#2A2B31]" />
          <Skeleton className="h-2 w-2 rounded-full bg-[#2A2B31]" />
        </div>
      )}
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

/**
 * Grid of skeleton cards for loading states
 */
export function CardSkeletonGrid({
  count = 6,
  variant = "default",
  className,
  ...props
}: {
  count?: number;
  variant?: CardSkeletonProps["variant"];
  className?: string;
} & Omit<CardSkeletonProps, "className">) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton
          key={index}
          variant={variant}
          {...props}
        />
      ))}
    </div>
  );
}

/**
 * Feature card specific skeleton
 */
export function FeatureCardSkeleton({ className }: { className?: string }) {
  return (
    <CardSkeleton
      variant="feature"
      withIcon={true}
      withBadge={true}
      withFooter={true}
      contentItems={2}
      className={className}
    />
  );
}

/**
 * Hero section skeleton
 */
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full flex justify-center items-center relative overflow-hidden", className)}>
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <Skeleton 
          className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-[#1A1B21] rounded-xl border border-[#2A2B31]"
          style={{ aspectRatio: '16/9' }}
        />
      </div>
    </div>
  );
}