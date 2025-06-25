import { CardSkeleton } from "./CardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * DashboardSkeleton component
 * Displays a loading placeholder for the main dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 ease-in-out">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} contentItems={1} withHeader={false} />
        ))}
      </div>
      
      {/* Main content section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="md:col-span-2">
          <CardSkeleton contentItems={1} className="h-[300px]" />
        </div>
        
        {/* Activity feed */}
        <div>
          <CardSkeleton contentItems={5} />
        </div>
      </div>
      
      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton contentItems={3} />
        <CardSkeleton contentItems={3} />
      </div>
    </div>
  );
}