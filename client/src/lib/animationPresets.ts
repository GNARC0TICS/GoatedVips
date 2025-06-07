/**
 * animationPresets.ts
 * Standard Framer Motion animation presets for section transitions.
 * DESIGN AGENT: Add or adjust presets as needed for the site.
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}; 