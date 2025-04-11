import React from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/services/profileService";
import { getTierFromWager, getTierInfo } from "@/lib/tier-utils";
import { cn } from "@/utils/cn";
import { 
  Edit, MessageSquare, UserPlus, Check, Shield, Award, Crown 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ProfileEmblem } from "./ProfileEmblem";

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
 * Enhanced with glass morphism, animations, and improved visuals
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
  // Parse totalWager as number - if it's a string, convert it
  const totalWagerValue = profile.totalWager 
    ? typeof profile.totalWager === 'string' 
      ? parseFloat(profile.totalWager) 
      : profile.totalWager
    : 0;
  
  const tierLevel = getTierFromWager(totalWagerValue);
  const tierInfo = getTierInfo(tierLevel);
  
  // Determine emblem size based on header size
  const emblemSizes = {
    sm: "sm",
    md: "md",
    lg: "xl",
  } as const;
  
  // Determine text sizes based on header size
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };
  
  // Determine button size based on header size
  const buttonSize = size === "lg" ? "default" : "sm";
  
  // Use the icon from tierInfo directly
  const TierIcon = tierInfo.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex items-center gap-4 p-6 rounded-xl backdrop-blur-sm",
        "bg-gradient-to-br from-gray-900/40 to-black/60 border border-gray-800/50",
        "shadow-xl",
        className
      )}
    >
      {/* Replace Avatar with enhanced ProfileEmblem */}
      <ProfileEmblem
        username={profile.username}
        color={profile.profileColor || "#D7FF00"}
        size={emblemSizes[size]}
        className="shadow-lg"
      />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <motion.h2 
            className={cn("font-bold", textSizes[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {profile.username}
          </motion.h2>
          
          {profile.isVerified && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Badge 
                variant="outline" 
                className="ml-1 bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                <span className="text-xs">Verified</span>
              </Badge>
            </motion.div>
          )}
        </div>
        
        <motion.div 
          className="flex items-center gap-3 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 px-2 py-1"
            style={{
              backgroundColor: `${tierInfo.hexColor}20`, // 20 = 12% opacity
              color: tierInfo.hexColor,
              borderColor: `${tierInfo.hexColor}40`, // 40 = 25% opacity
            }}
          >
            <TierIcon className="h-3 w-3" />
            <span className="text-xs capitalize">{tierLevel}</span>
          </Badge>
          
          {profile.goatedUsername && (
            <span className="text-xs text-gray-400" title="Goated Username">
              @{profile.goatedUsername}
            </span>
          )}
          
          {profile.bio && (
            <span className="text-xs text-gray-400 italic line-clamp-1">
              "{profile.bio}"
            </span>
          )}
        </motion.div>
      </div>
      
      <motion.div 
        className="ml-auto flex items-center gap-2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        {isOwner ? (
          <Button 
            variant="outline" 
            size={buttonSize} 
            onClick={onEdit}
            className="gap-1 bg-gray-800/50 hover:bg-gray-700/70 border-gray-700/50"
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
              className="gap-1 bg-gray-800/50 hover:bg-gray-700/70 border-gray-700/50"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {size !== "sm" && "Message"}
            </Button>
            
            <Button 
              variant="default" 
              size={buttonSize} 
              onClick={onFollow}
              className="gap-1 bg-[#D7FF00] hover:bg-[#C0E600] text-black font-medium"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {size !== "sm" && "Follow"}
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}