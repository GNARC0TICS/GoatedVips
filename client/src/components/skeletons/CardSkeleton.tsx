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
}

/**
 * CardSkeleton component
 * A flexible skeleton loader for card-based UI components
 */
export function CardSkeleton({
  withHeader = true,
  withFooter = false,
  contentItems = 3,
  className
}: CardSkeletonProps) {
  return (
    <div className={cn(
      "w-full rounded-lg border border-[#2A2B31] bg-[#121316] p-4 animate-in fade-in duration-300 ease-in-out",
      className
    )}>
      {/* Card header */}
      {withHeader && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A2B31]">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      )}
      
      {/* Card content */}
      <div className="space-y-4">
        {Array.from({ length: contentItems }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full max-w-[180px]" />
              {i % 2 === 0 && <Skeleton className="h-3 w-full max-w-[120px]" />}
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      
      {/* Card footer */}
      {withFooter && (
        <div className="flex justify-end items-center gap-3 mt-4 pt-2 border-t border-[#2A2B31]">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      )}
    </div>
  );
}