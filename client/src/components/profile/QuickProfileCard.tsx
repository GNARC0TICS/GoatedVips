import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getTierFromWager } from "@/lib/tier-utils";
import { Profile, profileService } from "@/services/profileService";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";
import { ProfileHeader } from "./ProfileHeader";
import { Link } from "wouter";

interface QuickProfileCardProps {
  profileId: string | number;
  onClose?: () => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Card component for displaying a quick preview of a user profile
 * Used for user mentions, hover cards, etc.
 */
export function QuickProfileCard({
  profileId,
  onClose,
  size = "md",
  className,
}: QuickProfileCardProps) {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile(profileId);
        setProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [profileId]);
  
  const isOwner = user ? profileService.isProfileOwner(profileId) : false;
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex h-24 items-center justify-center">
          <Spinner />
        </div>
      </Card>
    );
  }
  
  // Handle error state
  if (error || !profile) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center">
          <p className="text-sm text-red-500">
            {error?.message || "Unable to load profile"}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4">
        <ProfileHeader
          profile={profile}
          isOwner={isOwner}
          size={size}
          onEdit={() => {
            // Handle edit action
            if (onClose) onClose();
            // Navigate to edit profile page if needed
          }}
          onMessage={() => {
            // Handle message action
            if (onClose) onClose();
            // Open messaging UI if needed
          }}
          onFollow={() => {
            // Handle follow action
            if (onClose) onClose();
            // Follow the user if needed
          }}
        />
      </div>
      
      <div className="border-t border-border p-4">
        <Link
          to={`/profile/${profileId}`}
          onClick={onClose}
          className="block w-full"
        >
          <Button variant="default" className="w-full">
            View Full Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}