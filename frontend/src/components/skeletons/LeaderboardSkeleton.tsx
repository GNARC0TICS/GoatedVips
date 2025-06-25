import { Skeleton } from "@/components/ui/skeleton";

/**
 * LeaderboardSkeleton component
 * Displays a loading placeholder for the leaderboard during data fetching
 * 
 * @param rows - Number of skeleton rows to display
 */
export function LeaderboardSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full animate-in fade-in duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      {/* Column headers */}
      <div className="flex items-center p-3 mb-2 gap-4 text-xs text-[#8A8B91] border-b border-[#2A2B31]">
        <div className="w-10 text-center">#</div>
        <div className="flex-1">User</div>
        <div className="w-24 text-right">Wagered</div>
        <div className="w-24 text-right">Won</div>
        <div className="w-24 text-right">Profit</div>
      </div>
      
      {/* Skeleton rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center p-3 gap-4 hover:bg-[#1A1B21] transition-colors">
            <div className="w-10 text-center">
              <Skeleton className="h-4 w-4 mx-auto" />
            </div>
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="w-24 text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <div className="w-24 text-right">
              <Skeleton className="h-4 w-14 ml-auto" />
            </div>
            <div className="w-24 text-right">
              <Skeleton className="h-4 w-14 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}