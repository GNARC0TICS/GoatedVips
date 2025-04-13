import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animation-presets';

interface ProfileCardBioProps {
  bio: string;
  className?: string;
}

/**
 * Component for displaying user bio in profile cards
 */
export function ProfileCardBio({
  bio,
  className,
}: ProfileCardBioProps) {
  if (!bio) return null;
  
  return (
    <motion.div 
      className={cn(
        "text-sm text-white/85 mb-5 p-3 rounded-md bg-[#1A1B21]/50 border border-[#2A2B31]/50",
        className
      )}
      {...fadeInUp}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <p className="italic">{bio}</p>
    </motion.div>
  );
}
