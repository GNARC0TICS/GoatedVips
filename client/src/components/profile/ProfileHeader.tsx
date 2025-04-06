import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Profile } from "@/services/profileService";
import { getTierFromWager, getTierInfo } from "@/lib/tier-utils";
import { cn } from "@/utils/cn";
import { Edit, MessageSquare, User, UserPlus } from "lucide-react";

interface ProfileHeaderProps {
  profile: Profile;
  isOwner: boolean;
  size?: "sm" | "md" | "lg";
  onEdit?: () => void;
  onMessage?: () => void;
  onFollow?: () => void;
  className?: string;
}

/**
 * Header component for displaying user profile information
 * Includes avatar, username, tier badge, and action buttons
 */
export function ProfileHeader({
  profile,
  isOwner,
  size = "md",
  onEdit,
  onMessage,
  onFollow,
  className,
}: ProfileHeaderProps) {
  const tierLevel = profile.totalWager 
    ? getTierFromWager(profile.totalWager) 
    : "bronze";
  
  const tierInfo = getTierInfo(tierLevel);
  const TierIcon = tierInfo.icon;
  
  // Determine avatar size based on header size
  const avatarSizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };
  
  // Determine text sizes based on header size
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };
  
  // Determine button size based on header size
  const buttonSize = size === "lg" ? "default" : "sm";
  
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Avatar className={avatarSizes[size]}>
        <AvatarImage 
          src={profile.avatarUrl} 
          alt={`${profile.username}'s avatar`} 
        />
        <AvatarFallback>
          <User className="h-1/2 w-1/2" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h2 className={cn("font-bold", textSizes[size])}>
            {profile.username}
          </h2>
          
          {profile.verified && (
            <span 
              className="text-primary flex h-4 w-4 items-center justify-center rounded-full text-xs"
              title="Verified Profile"
            >
              ✓
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn("flex items-center gap-1", tierInfo.color)}>
            <TierIcon className="h-3.5 w-3.5" />
            {tierInfo.name}
          </span>
          
          {profile.goatedId && (
            <span className="text-muted-foreground" title="Goated ID">
              #{profile.goatedId}
            </span>
          )}
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        {isOwner ? (
          <Button 
            variant="outline" 
            size={buttonSize} 
            onClick={onEdit}
            className="gap-1"
          >
            <Edit className="h-3.5 w-3.5" />
            {size !== "sm" && "Edit Profile"}
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              size={buttonSize} 
              onClick={onMessage}
              className="gap-1"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {size !== "sm" && "Message"}
            </Button>
            
            <Button 
              variant="default" 
              size={buttonSize} 
              onClick={onFollow}
              className="gap-1"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {size !== "sm" && "Follow"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}