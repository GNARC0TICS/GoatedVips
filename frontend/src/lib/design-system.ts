/**
 * GOATED Design System
 * 
 * A comprehensive design system that ensures visual consistency and magical user experiences
 * across the entire application. This system is built around the golden ratio and perceptual
 * design principles for maximum visual impact.
 */

// ===== SPACING SYSTEM =====
// Built on 8px base unit with golden ratio progression for visual harmony
export const spacing = {
  // Base units (multiples of 8px)
  0: '0px',
  1: '4px',   // 0.5 * base
  2: '8px',   // 1 * base
  3: '12px',  // 1.5 * base
  4: '16px',  // 2 * base
  5: '20px',  // 2.5 * base
  6: '24px',  // 3 * base
  8: '32px',  // 4 * base
  10: '40px', // 5 * base
  12: '48px', // 6 * base
  16: '64px', // 8 * base
  20: '80px', // 10 * base
  24: '96px', // 12 * base
  32: '128px', // 16 * base
  
  // Semantic spacing for different contexts
  content: {
    xs: '12px',  // Tight content spacing
    sm: '16px',  // Default content spacing
    md: '24px',  // Medium content spacing
    lg: '32px',  // Large content spacing
    xl: '48px',  // Extra large content spacing
  },
  
  section: {
    xs: '32px',  // Small section gaps
    sm: '48px',  // Default section gaps
    md: '64px',  // Medium section gaps
    lg: '96px',  // Large section gaps
    xl: '128px', // Hero/major section gaps
  },
  
  component: {
    xs: '4px',   // Internal component spacing
    sm: '8px',   // Small component spacing
    md: '16px',  // Default component spacing
    lg: '24px',  // Large component elements
    xl: '32px',  // Component headers/footers
  }
} as const;

// ===== TYPOGRAPHY SYSTEM =====
// Modular scale based on golden ratio (1.618) for harmonic typography
export const typography = {
  scale: {
    xs: '12px',   // 0.75rem
    sm: '14px',   // 0.875rem
    base: '16px', // 1rem
    lg: '18px',   // 1.125rem
    xl: '20px',   // 1.25rem
    '2xl': '24px', // 1.5rem
    '3xl': '30px', // 1.875rem
    '4xl': '36px', // 2.25rem
    '5xl': '48px', // 3rem
    '6xl': '60px', // 3.75rem
    '7xl': '72px', // 4.5rem
    '8xl': '96px', // 6rem
    '9xl': '128px', // 8rem
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeights: {
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
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
// Expanded from your existing colors with better semantic naming and accessibility
export const colorSystem = {
  // Brand colors with full opacity scale
  brand: {
    yellow: {
      50: '#FEFCE8',
      100: '#FEF9C3',
      200: '#FEF08A', 
      300: '#FDE047',
      400: '#FACC15',
      500: '#D7FF00', // Primary brand
      600: '#C0E600',
      700: '#A6C700',
      800: '#8DA000',
      900: '#6B7600',
      950: '#4A5200',
    }
  },
  
  // Semantic grays for consistent backgrounds
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    850: '#1F1F1F',
    900: '#171717',
    925: '#14151A', // Primary background
    950: '#0A0A0A',
  },
  
  // Surface colors for cards and components
  surface: {
    primary: '#14151A',    // Main background
    secondary: '#1A1B21',  // Card backgrounds
    tertiary: '#23242A',   // Elevated surfaces
    quaternary: '#2A2B31', // Borders and dividers
    overlay: 'rgba(20, 21, 26, 0.95)', // Modal overlays
  },
  
  // Status colors with accessibility in mind
  status: {
    success: {
      light: '#34D399',
      default: '#10B981',
      dark: '#059669',
    },
    warning: {
      light: '#FBBF24',
      default: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#F87171',
      default: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#60A5FA',
      default: '#3B82F6',
      dark: '#2563EB',
    }
  }
} as const;

// ===== ELEVATION SYSTEM =====
// Box shadows that create depth hierarchy
export const elevation = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  
  // Special glow effects for brand elements
  glow: {
    yellow: '0 0 20px rgba(215, 255, 0, 0.4), 0 0 40px rgba(215, 255, 0, 0.2)',
    white: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
    brand: '0 0 30px rgba(215, 255, 0, 0.5), 0 0 60px rgba(215, 255, 0, 0.2), 0 0 90px rgba(215, 255, 0, 0.1)',
  },
  
  // Inner shadows for depth
  inner: {
    sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
    lg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)',
  }
} as const;

// ===== BORDER RADIUS SYSTEM =====
export const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// ===== ANIMATION SYSTEM =====
// Consistent timing and easing for magical interactions
export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Custom magical easing curves
    'magic-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'magic-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'magic-snap': 'cubic-bezier(0.19, 1, 0.22, 1)',
  },
  
  // Predefined animation combinations
  presets: {
    fadeIn: {
      duration: '300ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      fillMode: 'forwards',
    },
    scaleIn: {
      duration: '200ms', 
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fillMode: 'forwards',
    },
    slideUp: {
      duration: '400ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fillMode: 'forwards',
    }
  }
} as const;

// ===== COMPONENT PATTERNS =====
// Reusable component styling patterns
export const patterns = {
  // Card patterns with consistent styling
  card: {
    base: 'relative overflow-hidden border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-200',
    interactive: 'cursor-pointer hover:scale-[1.02] hover:border-[#D7FF00]/50 hover:shadow-[0_0_20px_rgba(215,255,0,0.4)] active:scale-[0.98] transition-all duration-150',
    elevated: 'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4),0_4px_6px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_8px_10px_-6px_rgba(0,0,0,0.4)]',
  },
  
  // Button patterns
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg',
    primary: 'bg-[#D7FF00] text-[#14151A] hover:bg-[#C0E600] shadow-[0_0_20px_rgba(215,255,0,0.4)] hover:shadow-[0_0_30px_rgba(215,255,0,0.5)]',
    ghost: 'text-[#A3A3A3] hover:text-[#D7FF00] hover:bg-[#23242A]',
  },
  
  // Layout patterns
  layout: {
    container: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
    section: 'py-12 sm:py-16 lg:py-24',
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      cards: 'grid gap-6 md:gap-8',
    }
  }
} as const;

// ===== UTILITY FUNCTIONS =====
export const utils = {
  // Generate spacing utilities
  spacing: (value: keyof typeof spacing) => spacing[value],
  
  // Generate color with opacity
  colorWithOpacity: (color: string, opacity: number) => 
    `${color}/${Math.round(opacity * 100)}`,
    
  // Combine classes safely
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
    
  // Generate responsive classes
  responsive: {
    text: (sm: string, md?: string, lg?: string) => 
      `text-${sm} ${md ? `md:text-${md}` : ''} ${lg ? `lg:text-${lg}` : ''}`.trim(),
    spacing: (sm: string, md?: string, lg?: string) =>
      `${sm} ${md ? `md:${md}` : ''} ${lg ? `lg:${lg}` : ''}`.trim(),
  }
} as const;

// ===== BREAKPOINTS =====
export const breakpoints = {
  xs: '475px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Export everything for easy importing
export const designSystem = {
  spacing,
  typography,
  colorSystem,
  elevation,
  borderRadius,
  animation,
  patterns,
  utils,
  breakpoints,
} as const;

export default designSystem; 