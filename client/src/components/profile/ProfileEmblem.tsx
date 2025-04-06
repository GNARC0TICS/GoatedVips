import React from 'react';
import { cn } from '@/lib/utils';

interface ProfileEmblemProps {
  username: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Profile emblem component for displaying a user's avatar
 * Uses the first letter of the username with a background color
 */
export function ProfileEmblem({
  username,
  color = '#D7FF00',
  size = 'md',
  className,
}: ProfileEmblemProps) {
  // Determine the first letter of the username
  const firstLetter = username ? username.charAt(0).toUpperCase() : '?';
  
  // Determine the size class
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-xl',
  };
  
  // Determine the emblem color
  // Use 20% opacity of the color for the background
  const backgroundColor = `${color}20`;
  const textColor = color;
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {firstLetter}
    </div>
  );
}

/**
 * Interactive version of ProfileEmblem with color picker
 */
export function ProfileEmblemEditor({
  username,
  color = '#D7FF00',
  onColorChange,
  size = 'md',
  className,
}: ProfileEmblemProps & {
  onColorChange: (color: string) => void;
}) {
  // Predefined color options
  const colorOptions = [
    '#D7FF00', // Lime
    '#FF5555', // Red
    '#55AAFF', // Blue
    '#AA55FF', // Purple
    '#55FFAA', // Teal
    '#FFAA55', // Orange
    '#FF55AA', // Pink
    '#FFFFFF', // White
  ];
  
  return (
    <div className="space-y-2">
      <ProfileEmblem
        username={username}
        color={color}
        size={size}
        className={className}
      />
      
      <div className="flex gap-1 flex-wrap">
        {colorOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={cn(
              'w-4 h-4 rounded-full transition-all',
              color === option ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
            )}
            style={{ backgroundColor: option }}
            onClick={() => onColorChange(option)}
            aria-label={`Select color ${option}`}
          />
        ))}
      </div>
    </div>
  );
}