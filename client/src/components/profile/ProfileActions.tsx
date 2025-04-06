import React from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/services/profileService";
import { cn } from "@/utils/cn";
import { 
  Edit, 
  MessageSquare, 
  Share2, 
  UserPlus, 
  Flag,
  Link, 
  Ban,
  ShieldAlert,
  Trophy
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ProfileActionsProps {
  profile: Profile;
  isOwner: boolean;
  className?: string;
  onEdit?: () => void;
  onMessage?: () => void;
  onFollow?: () => void;
  onShare?: () => void;
  onReport?: () => void;
}

/**
 * Component for displaying profile action buttons
 * Shows different actions based on profile ownership
 */
export function ProfileActions({
  profile,
  isOwner,
  className,
  onEdit,
  onMessage,
  onFollow,
  onShare,
  onReport,
}: ProfileActionsProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* Owner-specific actions */}
      {isOwner && (
        <>
          <Button 
            variant="default" 
            onClick={onEdit}
            className="gap-1.5"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>

          <Button 
            variant="outline" 
            onClick={onShare}
            className="gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>
          
          {profile.goatedId ? (
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://goated.com/user/${profile.goatedId}`, '_blank')}
              className="gap-1.5"
            >
              <Link className="h-4 w-4" />
              View on Goated
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="gap-1.5"
            >
              <Link className="h-4 w-4" />
              Link Goated Account
            </Button>
          )}
        </>
      )}
      
      {/* Non-owner actions */}
      {!isOwner && (
        <>
          <Button 
            variant="default" 
            onClick={onFollow}
            className="gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Follow
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onMessage}
            className="gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onShare}
            className="gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onReport}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
            Report
          </Button>
        </>
      )}
      
      {/* Admin-only actions */}
      {isAdmin && !isOwner && (
        <>
          <hr className="w-full border-t border-gray-200 dark:border-gray-800" />
          
          <Button 
            variant="outline" 
            className="gap-1.5 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
            onClick={() => {
              // Admin action to verify a profile
              if (confirm(`Do you want to ${profile.verified ? 'unverify' : 'verify'} this profile?`)) {
                // Handle verification action
              }
            }}
          >
            <Trophy className="h-4 w-4" />
            {profile.verified ? 'Unverify' : 'Verify'} User
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => {
              // Admin action to ban a user
              if (confirm('Are you sure you want to ban this user?')) {
                // Handle ban action
              }
            }}
          >
            <Ban className="h-4 w-4" />
            Ban User
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => {
              // Admin action to remove content
              if (confirm('Are you sure you want to remove all content from this user?')) {
                // Handle content removal action
              }
            }}
          >
            <ShieldAlert className="h-4 w-4" />
            Remove Content
          </Button>
        </>
      )}
    </div>
  );
}