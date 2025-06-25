import React from 'react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/services/profileService';
import { Link } from 'wouter';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gradients } from '@/lib/style-constants';

interface ProfileCardFooterProps {
  profile: UserProfile;
  isOwner: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Footer component for profile cards with action buttons
 */
export function ProfileCardFooter({
  profile,
  isOwner,
  onClose,
  className,
}: ProfileCardFooterProps) {
  return (
    <div 
      className={cn(
        "p-4 border-t border-[#2A2B31] flex justify-between items-center", 
        className
      )}
      style={{
        background: gradients.cardFooter
      }}
    >
      <Button 
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="text-[#9A9BA1] hover:text-white hover:bg-[#2A2B31]"
      >
        Close
      </Button>
      
      <div className="flex gap-2">
        {!isOwner && (
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-[#2A2B31] text-[#9A9BA1] hover:text-white hover:bg-[#2A2B31]"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Message
          </Button>
        )}
        
        <Link href={`/user-profile/${profile.id}`}>
          <Button 
            variant="default"
            size="sm"
            className="bg-[#D7FF00] text-black font-medium hover:bg-[#C0E600] transition-all duration-300"
            style={{
              boxShadow: '0 0 15px rgba(215, 255, 0, 0.3)'
            }}
          >
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
