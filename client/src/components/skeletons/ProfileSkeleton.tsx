import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProfileSkeleton component
 * Displays a loading placeholder for user profiles
 */
export function ProfileSkeleton() {
  return (
    <div className="w-full animate-in fade-in duration-300 ease-in-out">
      {/* Header with avatar */}
      <div className="flex items-start gap-6 mb-8">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-36" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#1A1B21] p-4 rounded-lg">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
      
      {/* Content sections */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#1A1B21] p-4 rounded-lg">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-14 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}