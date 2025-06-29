/**
 * Animation Presets
 * 
 * Reusable Framer Motion animation configurations
 * for consistent animations across the application.
 */

import { MotionProps } from 'framer-motion';

export type AnimationPreset = MotionProps;

/**
 * Fade in animation that moves slightly upward
 */
export const fadeInUp: AnimationPreset = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

/**
 * Fade in animation that moves slightly downward
 */
export const fadeInDown: AnimationPreset = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

/**
 * Simple fade in animation without movement
 */
export const fadeIn: AnimationPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

/**
 * Scale animation that grows from 95% to 100%
 */
export const scaleIn: AnimationPreset = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

/**
 * Card hover animation with scale effect
 */
export const cardHover: AnimationPreset = {
  whileHover: { scale: 1.02 },
  transition: { 
    type: 'spring', 
    stiffness: 400, 
    damping: 30 
  }
};

/**
 * Badge animation with bounce effect
 */
export const badgeBounce: AnimationPreset = {
  initial: { opacity: 0, scale: 0.8, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { 
    type: 'spring',
    stiffness: 400,
    damping: 15
  }
};

/**
 * Card list item animation
 */
export const cardListItem: AnimationPreset = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
  transition: { 
    type: 'spring', 
    stiffness: 400, 
    damping: 30
  }
};

/**
 * Dialog animation for modal content
 */
export const dialogContent: AnimationPreset = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

/**
 * Pulse animation for notifications or highlighting
 */
export const pulse: AnimationPreset = {
  animate: { 
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7]
  },
  transition: { 
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity
  }
};

/**
 * Subtle hover effect for buttons and clickable items
 */
export const buttonHover: AnimationPreset = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 }
};

/**
 * Progress bar animation
 */
export const progressBar: AnimationPreset = {
  initial: { width: '0%' },
  animate: { width: 'var(--progress-width, 0%)' },
  transition: { duration: 0.5, ease: 'easeOut' }
};

/**
 * Helper to apply animation delay to any preset
 */
export function withDelay(preset: AnimationPreset, delay: number): AnimationPreset {
  return {
    ...preset,
    transition: {
      ...preset.transition,
      delay
    }
  };
}

/**
 * Helper to create staggered animations for lists
 */
export function createStaggered(childPreset: AnimationPreset, staggerDelay = 0.1): {
  container: AnimationPreset;
  item: AnimationPreset;
} {
  return {
    container: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { 
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    },
    item: childPreset
  };
}

/**
 * Individual item variants for staggered lists
 */
export const staggerItem: AnimationPreset = {
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  },
};

/**
 * Generates a container variant that staggers its children.
 * Mirrors the helper that existed in the old animationPresets.ts file so
 * components like `AnimatedSection` can call `staggerContainer(...)`.
 */
export function staggerContainer(
  staggerChildren: number = 0.1,
  delayChildren: number = 0,
): { initial: string; animate: string; variants: any } {
  return {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren,
          delayChildren,
        },
      },
    },
  };
}
