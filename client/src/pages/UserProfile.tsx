import React from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profileService";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { Spinner } from "@/components/ui/spinner";
import { useProfile } from "@/hooks/use-profile";

export function UserProfile() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use our consolidated hook for profile fetching with stats
  const { profile, isLoading, error } = useProfile(userId, { includeStats: true });
  
  // Check if the current user is the profile owner using the profileService helper
  // This is more robust as it handles both numeric IDs and Goated IDs
  const isOwner = user ? profileService.isProfileOwner(userId) : false;
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto my-8 px-4">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error || !profile) {
    return (
      <div className="container mx-auto my-8 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
            Profile Not Found
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error?.message || "We couldn't find the requested profile. It may have been removed or you might not have permission to view it."}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto my-8 px-4">
      <ProfileLayout
        profile={profile}
        isOwner={isOwner}
        onEdit={() => {
          // Navigate to edit profile page
          console.log("Edit profile");
        }}
        onMessage={() => {
          // Open messaging UI
          console.log("Message user");
        }}
        onFollow={() => {
          // Follow the user
          console.log("Follow user");
        }}
        onShare={() => {
          // Share profile
          navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link copied",
            description: "Profile link has been copied to clipboard",
            type: "success",
          });
        }}
        onReport={() => {
          // Report profile
          console.log("Report user");
        }}
      >
        <div className="text-center text-muted-foreground">
          <p>User activity feed will appear here</p>
        </div>
      </ProfileLayout>
    </div>
  );
}

export default UserProfile;