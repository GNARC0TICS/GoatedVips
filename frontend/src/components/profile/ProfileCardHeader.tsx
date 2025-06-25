import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/services/profileService';
import { getTierFromWager, getTierInfo, TierLevel } from '@/lib/tier-utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProfileEmblem } from './ProfileEmblem';
import { User, Check } from 'lucide-react';
import { gradients } from '@/lib/style-constants';

interface ProfileCardHeaderProps {
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Header component for profile cards displaying user info, emblem and tier
 */
export function ProfileCardHeader({
  profile,
  size = 'md',
  className,
}: ProfileCardHeaderProps) {
  const tierLevel = profile?.tier as TierLevel || getTierFromWager(parseFloat(String(profile?.totalWager || 0)));
  const tierInfo = tierLevel ? getTierInfo(tierLevel) : undefined;
  
  return (
    <div 
      className={cn("p-5 relative", className)}
      style={{
        background: tierInfo?.glassGradient || gradients.cardBg,
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
        backgroundImage: tierInfo?.backgroundPattern ? `url(${tierInfo.backgroundPattern}), ${tierInfo?.glassGradient || gradients.cardBg}` : undefined,
        backgroundSize: tierInfo?.backgroundPattern ? 'cover, cover' : undefined,
        backgroundBlendMode: tierInfo?.backgroundPattern ? 'overlay' : undefined
      }}
    >
      {/* Verification Badge */}
      {profile.isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-3 right-3"
        >
          <Badge className="px-2 py-1 flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
            <Check className="h-3 w-3" />
            <span className="text-xs font-medium">Verified</span>
          </Badge>
        </motion.div>
      )}
      
      {/* User info with emblem */}
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ProfileEmblem 
            username={profile.username}
            color={profile.profileColor || '#D7FF00'}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            className="shadow-xl ring-2 ring-black/20"
          />
        </motion.div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-white text-lg truncate">{profile.username}</h3>
          
          {profile.goatedUsername && (
            <p className="text-xs text-[#9A9BA1] truncate flex items-center gap-1 mt-1">
              <User className="h-3 w-3" />
              <span className="opacity-80">Goated:</span> <span className="text-[#D7FF00]">{profile.goatedUsername}</span>
            </p>
          )}
          
          {tierInfo && (
            <div className="flex items-center gap-2 mt-2">
              <span 
                className="text-xs font-semibold px-2 py-1 rounded-md" 
                style={{ 
                  background: `linear-gradient(90deg, ${tierInfo.hexColor}22, ${tierInfo.hexColor}44)`,
                  color: tierInfo.hexColor,
                  border: `1px solid ${tierInfo.hexColor}66`,
                  boxShadow: `0 0 10px ${tierInfo.shadowColor || tierInfo.hexColor}40`
                }}
              >
                {tierInfo.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
