/**
 * GOATED UI Constants
 * 
 * Centralized design tokens for consistent, magical user experiences
 * Built on systematic design principles and accessibility standards
 */

// ===== SPACING SYSTEM =====
// Based on 8px grid system for perfect alignment
export const SPACING = {
  // Base spacing units
  0: '0px',
  1: '4px',    // 0.5 * 8px
  2: '8px',    // 1 * 8px (base unit)
  3: '12px',   // 1.5 * 8px
  4: '16px',   // 2 * 8px
  5: '20px',   // 2.5 * 8px
  6: '24px',   // 3 * 8px
  8: '32px',   // 4 * 8px
  10: '40px',  // 5 * 8px
  12: '48px',  // 6 * 8px
  16: '64px',  // 8 * 8px
  20: '80px',  // 10 * 8px
  24: '96px',  // 12 * 8px
  32: '128px', // 16 * 8px
  
  // Semantic spacing (use these in components)
  xs: '8px',   // Tight spacing
  sm: '16px',  // Small spacing  
  md: '24px',  // Medium spacing
  lg: '32px',  // Large spacing
  xl: '48px',  // Extra large spacing
  '2xl': '64px', // Section spacing
  '3xl': '96px', // Major section spacing
} as const;

// ===== TYPOGRAPHY SYSTEM =====
// Harmonious scale based on perfect fourth (1.333) ratio
export const TYPOGRAPHY = {
  // Font sizes
  size: {
    xs: '12px',   // 0.75rem - captions, labels
    sm: '14px',   // 0.875rem - small text
    base: '16px', // 1rem - body text
    lg: '18px',   // 1.125rem - large body
    xl: '21px',   // 1.333rem - small headings
    '2xl': '28px', // 1.75rem - medium headings
    '3xl': '37px', // 2.333rem - large headings
    '4xl': '49px', // 3.111rem - extra large headings
    '5xl': '65px', // 4.111rem - display text
    '6xl': '87px', // 5.444rem - hero text
  },
  
  // Font weights
  weight: {
    light: '300',
    normal: '400', 
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights for optimal readability
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375', 
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing for polish
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em', 
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  }
} as const;

// ===== COLOR SYSTEM =====
// Semantic color system for consistency and accessibility
export const COLORS = {
  // Brand colors
  brand: {
    primary: '#D7FF00',   // Main brand color
    hover: '#C0E600',     // Hover state
    pressed: '#A6C700',   // Pressed state
    light: '#E8FF66',     // Light variant
    dark: '#8DA000',      // Dark variant
  },
  
  // Background colors
  background: {
    primary: '#14151A',   // Main background
    secondary: '#1A1B21', // Card backgrounds
    tertiary: '#23242A',  // Elevated surfaces
    overlay: '#14151A',   // Modal overlays
  },
  
  // Border colors
  border: {
    primary: '#2A2B31',   // Default borders
    secondary: '#3A3B41', // Hover borders
    accent: '#D7FF00',    // Accent borders
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',   // Main text
    secondary: '#8A8B91', // Secondary text
    tertiary: '#525252',  // Muted text
    accent: '#D7FF00',    // Accent text
    inverse: '#14151A',   // Text on light backgrounds
  },
  
  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B', 
    error: '#EF4444',
    info: '#3B82F6',
  }
} as const;

// ===== ANIMATION SYSTEM =====
// Consistent timing and easing for fluid interactions
export const ANIMATION = {
  // Duration values for different interaction types
  duration: {
    instant: '0ms',
    fast: '150ms',     // Quick hover effects
    normal: '200ms',   // Standard transitions
    slow: '300ms',     // Complex state changes
    slower: '500ms',   // Page transitions
    slowest: '1000ms', // Special effects
  },
  
  // Easing curves for natural motion
  easing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Custom magical easing curves
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'snap': 'cubic-bezier(0.19, 1, 0.22, 1)',
  },
  
  // Stagger timing for grouped animations
  stagger: {
    fast: 0.05,   // Quick succession
    normal: 0.1,  // Standard stagger
    slow: 0.2,    // Slow reveal
  }
} as const;

// ===== SHADOW SYSTEM =====
// Elevation shadows for depth hierarchy
export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.25)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.4), 0 8px 10px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.5)',
  
  // Magical glow effects
  glow: {
    brand: `0 0 20px ${COLORS.brand.primary}40, 0 0 40px ${COLORS.brand.primary}20`,
    'brand-intense': `0 0 30px ${COLORS.brand.primary}60, 0 0 60px ${COLORS.brand.primary}30`,
    white: '0 0 20px rgba(255, 255, 255, 0.3)',
  },
  
  // Inner shadows for depth
  inner: {
    sm: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
    md: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  }
} as const;

// ===== BORDER RADIUS =====
// Consistent radius values for cohesive design
export const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ===== COMPONENT PATTERNS =====
// Reusable styling combinations for consistency
export const PATTERNS = {
  // Container patterns
  container: {
    page: `container mx-auto px-${SPACING[4]} sm:px-${SPACING[6]} lg:px-${SPACING[8]} max-w-7xl`,
    section: `py-${SPACING[12]} sm:py-${SPACING[16]} lg:py-${SPACING[24]}`,
  },
  
  // Card patterns
  card: {
    base: `rounded-${RADIUS.xl} border border-[${COLORS.border.primary}] bg-[${COLORS.background.secondary}]/50 backdrop-blur-sm`,
    interactive: `cursor-pointer transition-all duration-${ANIMATION.duration.fast} hover:scale-[1.02] hover:shadow-[${SHADOWS.glow.brand}]`,
    padding: {
      sm: `p-${SPACING[4]}`,
      md: `p-${SPACING[6]}`,
      lg: `p-${SPACING[8]}`,
    }
  },
  
  // Button patterns  
  button: {
    base: `inline-flex items-center justify-center font-medium rounded-${RADIUS.lg} transition-all duration-${ANIMATION.duration.fast}`,
    primary: `bg-[${COLORS.brand.primary}] text-[${COLORS.text.inverse}] hover:bg-[${COLORS.brand.hover}] shadow-[${SHADOWS.glow.brand}]`,
    secondary: `border border-[${COLORS.border.primary}] text-[${COLORS.text.primary}] hover:bg-[${COLORS.background.tertiary}]`,
    ghost: `text-[${COLORS.text.secondary}] hover:text-[${COLORS.brand.primary}] hover:bg-[${COLORS.background.tertiary}]`,
    size: {
      sm: `px-${SPACING[3]} py-${SPACING[2]} text-${TYPOGRAPHY.size.sm}`,
      md: `px-${SPACING[4]} py-${SPACING[3]} text-${TYPOGRAPHY.size.base}`,
      lg: `px-${SPACING[6]} py-${SPACING[4]} text-${TYPOGRAPHY.size.lg}`,
    }
  },
  
  // Typography patterns
  text: {
    heading: {
      1: `text-${TYPOGRAPHY.size['6xl']} sm:text-${TYPOGRAPHY.size['6xl']} lg:text-${TYPOGRAPHY.size['6xl']} font-${TYPOGRAPHY.weight.black} text-[${COLORS.text.primary}] leading-${TYPOGRAPHY.lineHeight.tight}`,
      2: `text-${TYPOGRAPHY.size['4xl']} sm:text-${TYPOGRAPHY.size['5xl']} font-${TYPOGRAPHY.weight.bold} text-[${COLORS.text.primary}] leading-${TYPOGRAPHY.lineHeight.tight}`,
      3: `text-${TYPOGRAPHY.size['2xl']} sm:text-${TYPOGRAPHY.size['3xl']} font-${TYPOGRAPHY.weight.semibold} text-[${COLORS.text.primary}] leading-${TYPOGRAPHY.lineHeight.snug}`,
      4: `text-${TYPOGRAPHY.size.xl} sm:text-${TYPOGRAPHY.size['2xl']} font-${TYPOGRAPHY.weight.medium} text-[${COLORS.text.primary}] leading-${TYPOGRAPHY.lineHeight.snug}`,
    },
    body: {
      large: `text-${TYPOGRAPHY.size.lg} text-[${COLORS.text.primary}] leading-${TYPOGRAPHY.lineHeight.relaxed}`,
      normal: `text-${TYPOGRAPHY.size.base} text-[${COLORS.text.primary}] leading-${TYPOGRAPHY.lineHeight.normal}`,
      small: `text-${TYPOGRAPHY.size.sm} text-[${COLORS.text.secondary}] leading-${TYPOGRAPHY.lineHeight.normal}`,
      caption: `text-${TYPOGRAPHY.size.xs} text-[${COLORS.text.tertiary}] leading-${TYPOGRAPHY.lineHeight.normal}`,
    }
  },
  
  // Grid patterns
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cards: `grid gap-${SPACING[6]} md:gap-${SPACING[8]}`,
    auto: 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
  }
} as const;

// ===== BREAKPOINTS =====
// Consistent breakpoints for responsive design
export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ===== UTILITY FUNCTIONS =====
export const utils = {
  // Combine classes safely
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
    
  // Get spacing value
  spacing: (key: keyof typeof SPACING) => SPACING[key],
  
  // Get color with opacity
  colorWithOpacity: (color: string, opacity: number) => 
    `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    
  // Responsive text helper
  responsiveText: (base: string, md?: string, lg?: string) => 
    `text-${base} ${md ? `md:text-${md}` : ''} ${lg ? `lg:text-${lg}` : ''}`.trim(),
} as const;

// Export everything for easy importing
export default {
  SPACING,
  TYPOGRAPHY, 
  COLORS,
  ANIMATION,
  SHADOWS,
  RADIUS,
  PATTERNS,
  BREAKPOINTS,
  utils,
} as const; 