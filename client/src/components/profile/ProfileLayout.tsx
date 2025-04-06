import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile } from "@/services/profileService";
import { cn } from "@/utils/cn";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileTierProgress } from "./ProfileTierProgress";
import { ProfileActions } from "./ProfileActions";
import { Spinner } from "@/components/ui/spinner";

interface ProfileLayoutProps {
  profile: Profile;
  isOwner: boolean;
  isLoading?: boolean;
  className?: string;
  onEdit?: () => void;
  onMessage?: () => void;
  onFollow?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  children?: React.ReactNode;
}

/**
 * Layout component for the profile page
 * Provides consistent structure for all profile views
 */
export function ProfileLayout({
  profile,
  isOwner,
  isLoading = false,
  className,
  onEdit,
  onMessage,
  onFollow,
  onShare,
  onReport,
  children,
}: ProfileLayoutProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile header */}
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        size="lg"
        onEdit={onEdit}
        onMessage={onMessage}
        onFollow={onFollow}
      />
      
      {/* Action buttons */}
      <ProfileActions
        profile={profile}
        isOwner={isOwner}
        onEdit={onEdit}
        onMessage={onMessage}
        onFollow={onFollow}
        onShare={onShare}
        onReport={onReport}
      />
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats section - 2/3 width on desktop */}
        <div className="md:col-span-2">
          <ProfileStats profile={profile} />
        </div>
        
        {/* Tier progress - 1/3 width on desktop */}
        <div>
          <ProfileTierProgress profile={profile} />
        </div>
      </div>
      
      {/* Tabs for different profile sections */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="bets">Bets</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          {isOwner && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="activity" className="mt-6">
          {children ? children : <p>No recent activity to display.</p>}
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-6">
          <p>Achievements and badges will appear here.</p>
        </TabsContent>
        
        <TabsContent value="bets" className="mt-6">
          <p>Betting history will appear here.</p>
        </TabsContent>
        
        <TabsContent value="followers" className="mt-6">
          <p>Followers and connections will appear here.</p>
        </TabsContent>
        
        {isOwner && (
          <TabsContent value="settings" className="mt-6">
            <p>Profile settings will appear here.</p>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}