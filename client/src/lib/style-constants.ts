/**
 * Style Constants
 * 
 * This file centralizes commonly used style patterns across the application.
 * Using these constants helps maintain consistency and reduces repetitive
 * style declarations throughout the codebase.
 */

/**
 * Container styles for consistent layout spacing
 */
export const containerStyles = {
  /** Standard page container with responsive padding */
  page: "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
  
  /** Narrower container for content-focused sections */
  content: "container mx-auto px-4 max-w-5xl",
  
  /** Container for section with vertical spacing */
  section: "py-8 md:py-12 lg:py-16",
  
  /** Full-width container with only horizontal padding */
  full: "px-4 sm:px-6 lg:px-8 w-full"
};

/**
 * Card component style patterns
 */
export const cardStyles = {
  /** Base card with hover effects */
  base: "relative p-4 md:p-6 lg:p-8 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm hover:border-[#D7FF00]/50 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 h-full w-full flex flex-col justify-between",
  
  /** Card with hover scaling effect */
  interactive: "transform transition-all duration-300 hover:scale-[1.02]",
  
  /** Card header styles */
  header: "flex items-center justify-center gap-2 mb-4",
  
  /** Card content styles */
  content: "text-[#8A8B91] mb-6 font-body text-center",
  
  /** Card footer styles */
  footer: "mt-auto"
};

/**
 * Text style patterns
 */
export const textStyles = {
  /** Primary heading style */
  heading: "text-2xl md:text-3xl lg:text-4xl font-heading text-white",
  
  /** Secondary heading style */
  subheading: "text-xl md:text-2xl font-heading text-white",
  
  /** Normal body text */
  body: "text-[#8A8B91] font-body",
  
  /** Accent text (typically for links or highlights) */
  accent: "text-[#D7FF00] font-heading hover:text-[#D7FF00]/80 transition-colors"
};

/**
 * Button style patterns
 */
export const buttonStyles = {
  /** Primary button style */
  primary: "bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90 transition-colors",
  
  /** Secondary button style */
  secondary: "bg-[#242530] text-white hover:bg-[#2A2B36] rounded-lg",
  
  /** Outline button style */
  outline: "border border-[#2A2B31] hover:bg-[#2A2B31]/50 hover:text-white transition-colors",
  
  /** Ghost button style */
  ghost: "text-white hover:text-[#D7FF00] transition-colors hover:bg-transparent"
};

/**
 * Badge style patterns
 */
export const badgeStyles = {
  /** Primary badge style */
  primary: "text-xs font-heading text-[#D7FF00] px-2 py-1 bg-[#D7FF00]/10 rounded-full",
  
  /** Status badge (active) */
  active: "flex items-center gap-1 text-xs text-green-500",
  
  /** Status badge (alert) */
  alert: "flex items-center gap-1 text-xs text-red-500"
};

/**
 * Animation patterns
 * For use with normal CSS (not Framer Motion)
 */
export const animationStyles = {
  /** Pulse animation */
  pulse: "animate-pulse",
  
  /** Spin animation */
  spin: "animate-spin",
  
  /** Bounce animation */
  bounce: "animate-bounce",
  
  /** Wiggle animation (requires custom keyframes) */
  wiggle: "animate-wiggle"
};

/**
 * Header and navigation styles
 */
export const navStyles = {
  /** Header container */
  header: "fixed top-0 left-0 right-0 z-50 bg-[#14151A]/80 backdrop-blur-xl border-b border-[#2A2B31]/50",
  
  /** Navigation container */
  nav: "h-16 md:h-20 flex items-center justify-between",
  
  /** Mobile menu button */
  mobileButton: "md:hidden relative overflow-hidden group",
  
  /** Desktop navigation */
  desktop: "hidden md:flex items-center space-x-4"
};

/**
 * Footer styles
 */
export const footerStyles = {
  /** Footer container */
  wrapper: "bg-[#D7FF00] relative mt-auto",
  
  /** Footer content */
  content: "container mx-auto px-4 py-16",
  
  /** Footer grid layout */
  grid: "grid grid-cols-1 md:grid-cols-2 gap-12",
  
  /** Footer heading */
  heading: "font-heading text-[#14151A] text-2xl font-bold"
};
