/**
 * Animation Presets
 * 
 * Reusable animation configurations for Framer Motion.
 * Using these presets helps maintain consistency and reduces
 * repetitive animation code throughout the application.
 */

import { MotionProps } from "framer-motion";

/**
 * Fade In animation preset
 * For elements that should fade in from transparent to opaque
 */
export const fadeIn: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

/**
 * Fade In Up animation preset
 * For elements that should fade in while moving upward
 */
export const fadeInUp: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

/**
 * Fade In Down animation preset
 * For elements that should fade in while moving downward
 */
export const fadeInDown: MotionProps = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

/**
 * Scale In animation preset
 * For elements that should scale up from smaller size
 */
export const scaleIn: MotionProps = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

/**
 * Stagger Children animation preset
 * For parent containers with multiple child animations
 */
export const staggerChildren: MotionProps = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Get animation with custom delay
 * 
 * @param baseAnimation - Base animation preset
 * @param delay - Delay in seconds
 * @returns Modified animation with delay
 */
export function withDelay(baseAnimation: MotionProps, delay: number): MotionProps {
  return {
    ...baseAnimation,
    transition: {
      ...baseAnimation.transition,
      delay
    }
  };
}
