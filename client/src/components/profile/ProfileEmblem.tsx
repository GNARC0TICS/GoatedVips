import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Utility function to convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  // Remove the hash if it exists
  const cleanHex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  
  return `${r}, ${g}, ${b}`;
}

interface ProfileEmblemProps {
  username: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Profile emblem component for displaying a user's avatar
 * Uses the first letter of the username with a background color
 * Enhanced with glass morphism effect and animations
 */
export function ProfileEmblem({
  username,
  color = '#D7FF00',
  size = 'md',
  className,
}: ProfileEmblemProps) {
  // Determine the first letter of the username or use first 2 letters for shorter display
  const initials = username 
    ? username.length > 1 
      ? username.substring(0, 2).toUpperCase() 
      : username.charAt(0).toUpperCase() 
    : '?';
  
  // Determine the size class with enhanced dimensions
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };
  
  // Parse the hex color to RGB for glass morphism effects
  const rgbValues = hexToRgb(color);
  
  // Enhanced color handling for glass morphism effect
  const backgroundColor = `rgba(${rgbValues}, 0.15)`;
  const borderColor = `rgba(${rgbValues}, 0.3)`;
  const textColor = color;
  const glowColor = `0 0 15px rgba(${rgbValues}, 0.4)`;
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.3
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 20px rgba(${rgbValues}, 0.6)` 
      }}
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        'backdrop-blur-sm transition-all duration-300',
        'border-2 shadow-lg',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
        boxShadow: glowColor,
      }}
    >
      {/* Add subtle fade in animation for the initials */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {initials}
      </motion.span>
    </motion.div>
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
      
      <motion.div 
        className="flex gap-1 flex-wrap"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {colorOptions.map((option, index) => (
          <motion.button
            key={option}
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.1 + (index * 0.05), 
              type: "spring",
              stiffness: 300,
              damping: 15 
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'w-4 h-4 rounded-full transition-all',
              color === option ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
            )}
            style={{ backgroundColor: option }}
            onClick={() => onColorChange(option)}
            aria-label={`Select color ${option}`}
          />
        ))}
      </motion.div>
    </div>
  );
}