import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/services/profileService';
import { cn } from '@/lib/utils';
import { Check, Clock, ExternalLink, User } from 'lucide-react';
import { fadeInUp } from '@/lib/animation-presets';

interface ProfileCardStatusProps {
  profile: UserProfile;
  isOwner: boolean;
  user: UserProfile | null;
  className?: string;
}

/**
 * Component for displaying account status information in profile cards
 */
export function ProfileCardStatus({
  profile,
  isOwner,
  user,
  className,
}: ProfileCardStatusProps) {
  return (
    <motion.div 
      className={cn("space-y-2", className)}
      {...fadeInUp}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {/* Only show account link status for the users who registered on our platform */}
      {user ? (
        profile.goatedAccountLinked ? (
          <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-green-900/20">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-white/90 font-medium">Goated Account Linked</span>
          </div>
        ) : profile.goatedLinkRequested ? (
          <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-orange-900/20">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-white/90 font-medium">Link Request Pending</span>
          </div>
        ) : isOwner ? (
          <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-blue-900/20">
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <span className="text-white/90 font-medium">Link Your Goated Account</span>
          </div>
        ) : null
      ) : profile.goatedId ? (
        // For Goated users in leaderboard, show Goated ID if available
        <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-[#2A2B31]/30">
          <User className="h-4 w-4 text-[#9A9BA1]" />
          <span className="text-[#9A9BA1] font-medium truncate">
            Goated ID: <span className="font-mono text-xs">{profile.goatedId.substring(0, 10)}...</span>
          </span>
        </div>
      ) : null}
      
      {/* Created Date */}
      {profile.createdAt && (
        <div className="bg-[#1A1B21]/50 p-3 rounded-md flex items-center gap-2 border border-[#2A2B31]/30">
          <Clock className="h-4 w-4 text-[#9A9BA1]" />
          <span className="text-[#9A9BA1] font-medium">
            Joined {new Date(profile.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', 
              month: 'short', 
              day: 'numeric'
            })}
          </span>
        </div>
      )}
    </motion.div>
  );
}
