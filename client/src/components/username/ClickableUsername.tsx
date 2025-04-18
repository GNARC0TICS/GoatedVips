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
  // Stop propagation to prevent unwanted parent clicks and handle navigation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser behavior
    e.stopPropagation(); // Stop event bubbling
    
    // If custom click handler is provided, use it
    if (onClick) {
      onClick(e);
    } 
    // Otherwise if not using QuickProfile, navigate to profile page directly
    else if (!withQuickProfile) {
      // Use window.location for more direct navigation
      window.location.href = `/profile/${userId}`;
    }
    // When withQuickProfile=true, the QuickProfile component handles the click
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
          onTouchStart={(e) => {
            e.stopPropagation(); // Ensure touch events don't propagate
            // Add visual feedback for touch
            e.currentTarget.style.color = '#D7FF00';
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            // Reset color after touch
            e.currentTarget.style.color = '';
            // Trigger click handler manually for better mobile response
            handleClick(e as unknown as React.MouseEvent);
          }}
          style={{
            ...mobileStyles,
            minHeight: '30px', // Ensure minimum touch target height
            padding: '2px 0' // Add some padding for easier touch
          }}
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
        onTouchStart={(e) => {
          e.stopPropagation(); // Ensure touch events don't propagate
          // Add visual feedback for touch
          e.currentTarget.style.color = '#D7FF00';
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          // Reset color after touch
          e.currentTarget.style.color = '';
          // Trigger click handler manually for better mobile response
          handleClick(e as unknown as React.MouseEvent);
        }}
        style={{
          ...mobileStyles,
          minHeight: '30px', // Ensure minimum touch target height
          padding: '2px 0' // Add some padding for easier touch
        }}
        role="button"
        aria-label={`View ${username}'s profile`}
      >
        {username}
      </a>
    </Link>
  );
}

export default ClickableUsername;