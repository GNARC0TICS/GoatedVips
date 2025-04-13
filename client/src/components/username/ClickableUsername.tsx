import React from 'react';
import { Link } from 'wouter';
import { QuickProfile } from '@/components/profile/QuickProfile';

interface ClickableUsernameProps {
  username: string;
  userId: string;
  className?: string;
  withQuickProfile?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * A reusable component for displaying clickable usernames consistently throughout the site
 * 
 * @param username - The display name of the user
 * @param userId - The user ID for profile linking and QuickProfile
 * @param className - Optional custom CSS classes
 * @param withQuickProfile - Whether to wrap with QuickProfile popup (default: true)
 * @param onClick - Optional click handler
 */
export function ClickableUsername({ 
  username, 
  userId, 
  className = "text-white hover:text-[#D7FF00] transition-colors cursor-pointer", 
  withQuickProfile = true,
  onClick
}: ClickableUsernameProps) {
  // Stop propagation to prevent unwanted parent clicks
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser behavior
    e.stopPropagation(); // Stop event bubbling
    if (onClick) onClick(e);
  };
  
  // Mobile-friendly styles
  const mobileStyles = {
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    userSelect: 'none' as 'none', // Type assertion to fix TS error
  };
  
  // Default rendering with QuickProfile popup
  if (withQuickProfile) {
    return (
      <QuickProfile userId={userId} username={username}>
        <button 
          type="button"
          className={`username-trigger ${className} inline-block text-inherit bg-transparent border-0 p-0 m-0`}
          onClick={handleClick}
          onTouchStart={(e) => e.stopPropagation()} // Ensure touch events don't propagate
          style={mobileStyles}
          role="button"
          aria-label={`View ${username}'s profile`}
        >
          {username}
        </button>
      </QuickProfile>
    );
  }
  
  // Simple link to profile
  return (
    <Link href={`/profile/${userId}`}>
      <a 
        className={className}
        onClick={handleClick}
        onTouchStart={(e) => e.stopPropagation()} // Ensure touch events don't propagate
        style={mobileStyles}
        role="button"
        aria-label={`View ${username}'s profile`}
      >
        {username}
      </a>
    </Link>
  );
}

export default ClickableUsername;