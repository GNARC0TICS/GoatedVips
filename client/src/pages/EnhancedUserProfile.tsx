import React from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profileService";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { useProfile } from "@/hooks/use-profile";
import { ErrorBoundary } from "react-error-boundary";
import { EnhancedProfileLayout } from "@/components/profile/EnhancedProfileLayout";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";

/**
 * Enhanced user profile page with improved layout and visual design
 */
export function EnhancedUserProfile() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch profile with stats included
  const { profile, isLoading, error, fetchProfile } = useProfile(userId, { includeStats: true });

  const isOwner = React.useMemo(() => {
    if (!user || !profile) return false;
    return profileService.isProfileOwner(userId);
  }, [user, profile, userId]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={fetchProfile}
    >
      <div className="container mx-auto my-8 px-4">
        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={fetchProfile}
          />
        ) : !profile ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Profile Not Found</h2>
            <p className="text-red-600 dark:text-red-300">
              We couldn't find the requested profile. It may have been removed or you might not have permission to view it.
            </p>
          </div>
        ) : (
          <EnhancedProfileLayout
            profile={profile}
            isOwner={isOwner}
            onEdit={() => {
              console.log("Edit profile");
              toast({ title: "Edit Profile", description: "Navigate to edit page", type: "info" });
            }}
            onMessage={() => {
              console.log("Message user");
              toast({ title: "Message User", description: "Open messaging UI", type: "info" });
            }}
            onFollow={() => {
              console.log("Follow user");
              toast({ title: "Followed", description: "You are now following this user", type: "success" });
            }}
            onShare={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({ title: "Link copied", description: "Profile link has been copied to clipboard", type: "success" });
            }}
            onReport={() => {
              console.log("Report user");
              toast({ title: "Reported", description: "Profile has been reported", type: "warning" });
            }}
          >
            <div className="space-y-6">
              <div className="text-center text-muted-foreground pb-6 border-b border-[#2A2B31]/50">
                <p className="text-[#9A9BA1]">User activity feed will appear here</p>
              </div>
              
              {/* Recent Activity Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <div className="rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50 p-4">
                  <p className="text-[#9A9BA1] text-sm">No recent activity to display.</p>
                </div>
              </div>
            </div>
          </EnhancedProfileLayout>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default EnhancedUserProfile;
