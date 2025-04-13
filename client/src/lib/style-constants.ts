/**
 * Style Constants
 * 
 * Centralized styles for consistent component appearance.
 * These can be imported and used in any component to maintain
 * design consistency across the application.
 */

export const colors = {
  // Primary brand colors
  brand: {
    primary: '#D7FF00',
    primaryHover: '#C0E600',
    primaryDark: '#A6C700',
    accent: '#F59E0B'
  },
  
  // Background colors
  background: {
    primary: '#14151A',
    secondary: '#1A1B21',
    tertiary: '#23242A',
    card: '#1A1B21',
    overlay: 'rgba(20, 21, 26, 0.8)'
  },
  
  // Border colors
  border: {
    light: '#2A2B31',
    medium: '#3A3B41',
    dark: '#14151A'
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#9A9BA1',
    accent: '#D7FF00',
    muted: 'rgba(255, 255, 255, 0.7)'
  },
  
  // Status colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  },
  
  // MVP time period colors
  mvpPeriod: {
    daily: {
      primary: '#8B5CF6', // violet
      accent: '#7C3AED',
      shine: '#A78BFA'
    },
    weekly: {
      primary: '#10B981', // emerald
      accent: '#059669',
      shine: '#34D399'
    },
    monthly: {
      primary: '#F59E0B', // amber
      accent: '#D97706',
      shine: '#FBBF24'
    },
    allTime: {
      primary: '#EC4899', // pink
      accent: '#DB2777', 
      shine: '#F472B6'
    }
  },
  
  // Tier colors
  tier: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    elite: '#D7FF00'
  }
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
  glow: (color: string, opacity = 0.3) => `0 0 15px rgba(${hexToRgb(color)}, ${opacity})`,
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
};

export const gradients = {
  cardBg: `linear-gradient(140deg, ${colors.background.secondary} 0%, ${colors.background.primary} 100%)`,
  primaryGlow: `linear-gradient(to right, ${colors.brand.primary}20, ${colors.brand.primary}40)`,
  darkOverlay: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  cardHeader: `linear-gradient(to bottom, ${colors.background.tertiary}50, ${colors.background.secondary}50)`,
  cardFooter: `linear-gradient(180deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%)`,
  tierProgressBar: (color: string) => `linear-gradient(90deg, ${color}80, ${color})`,
  mvpHeader: (color: string) => `linear-gradient(to bottom, ${color}20, transparent)`
};

export const containers = {
  page: "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
  section: "container mx-auto px-4 max-w-5xl",
  card: "p-4 md:p-6 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm"
};

export const cardStyles = {
  base: "relative p-4 rounded-xl border border-[#2A2B31] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg",
  interactive: "transform transition-all duration-300 hover:scale-[1.02]",
  hover: "relative p-4 rounded-xl border border-[var(--hover-border-color,#2A2B31)] bg-[#1A1B21]/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-[var(--hover-shadow-color,#00000040)] hover:border-[var(--hover-border-color,#2A2B31)]",
  dialog: "bg-[#1A1B21] border-[#2A2B31] max-w-[95vw] md:max-w-2xl w-full mx-4 md:mx-0",
  // New profile card styles
  profileCard: {
    base: "relative overflow-hidden border shadow-xl",
    sm: "w-full max-w-[280px]", 
    md: "w-full max-w-[340px]",
    lg: "w-full max-w-[400px]",
    xl: "w-full max-w-[480px]",
    responsive: "w-full max-w-full sm:max-w-[340px] md:max-w-[380px] lg:max-w-[400px]"
  },
  profileStatsGrid: {
    base: "grid gap-2",
    twoCol: "grid-cols-2",
    threeCol: "grid-cols-3",
    fourCol: "grid-cols-2 sm:grid-cols-4",
    adaptive: "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
  },
  tierCard: {
    base: "relative overflow-hidden border rounded-lg",
    glow: "shadow-[0_0_15px_rgba(var(--tier-color-rgb),0.2)]"
  }
};

export const buttonStyles = {
  primary: "bg-[#D7FF00] text-black font-medium hover:bg-[#C0E600] transition-all duration-300",
  secondary: "bg-[#1A1B21] border border-[#2A2B31] text-white hover:bg-[#23242A]",
  outline: "bg-transparent border border-[#2A2B31] text-white hover:bg-[#1A1B21]/50",
  ghost: "text-[#9A9BA1] hover:text-white hover:bg-[#2A2B31]"
};

export const textStyles = {
  heading: "font-heading text-white",
  cardTitle: "text-lg font-heading text-white",
  cardSubtitle: "text-sm text-[#9A9BA1]",
  label: "text-xs text-[#9A9BA1]",
  value: "font-bold text-white",
  mono: "font-mono",
  error: "text-red-400",
  subtle: "text-gray-400",
  success: "text-green-500",
  warning: "text-yellow-500",
  info: "text-blue-400"
};

export const headerClasses = {
  container:
    "fixed top-0 left-0 right-0 z-50 bg-[#14151A]/80 backdrop-blur-xl border-b border-[#2A2B31]/50",
  nav: "container mx-auto h-16 px-4 flex items-center justify-between",
  logo: "h-6 sm:h-7 md:h-8 w-auto relative object-contain transition-transform duration-300",
  menuButton: "md:hidden relative overflow-hidden group",
  desktopNav: "hidden md:flex items-center space-x-4",
  userSection: "flex items-center gap-2 md:gap-3",
  mobileSearchDropdown: "md:hidden fixed left-0 right-0 top-16 bg-[#14151A] border-b border-[#2A2B31] transition-all duration-300 z-50",
  mobileSearchContainer: "container mx-auto px-4 py-2 relative",
  mobileSearchButton: "md:hidden h-10 w-10 flex items-center justify-center transform transition-transform duration-300 hover:scale-110",
  mobileCloseButton: "absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center",
  logoContainer: "flex items-center justify-center overflow-hidden", // New class for better logo containment
};

export const mobileClasses = {
  navContainer: "w-[300px] bg-[#14151A] border-r border-[#2A2B31] overflow-y-auto p-0",
  navContent: "flex flex-col gap-4 pt-8",
  sectionTitle: "px-4 py-2 text-[#D7FF00] font-heading text-base font-bold",
  sectionDivider: "mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6",
  actionSection: "mt-6 px-4 border-t border-[#2A2B31]/50 pt-6 space-y-3",
  linkActive: "bg-[#D7FF00]/10 text-[#D7FF00]",
  linkInactive: "text-white hover:bg-[#2A2B31]",
  linkText: "px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer",
  badge: {
    live: "ml-2 flex items-center gap-1 text-xs text-red-500",
    ongoing: "ml-2 flex items-center gap-1 text-xs text-green-500",
    new: "ml-2 flex items-center gap-1 text-xs text-blue-500",
    indicator: "h-2 w-2 rounded-full animate-pulse"
  }
};

export const footerClasses = {
  wrapper: "bg-[#D7FF00] relative mt-auto",
  container: "container mx-auto px-4 py-16",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-12",
  heading: "font-heading text-[#14151A] text-2xl font-bold",
  bottomBar: "bg-[#14151A] text-[#8A8B91] text-sm py-6",
};

export const dropdownClasses = {
  content:
    "w-56 bg-[#1A1B21]/95 backdrop-blur-xl border border-[#2A2B31] rounded-xl shadow-2xl py-2 px-1",
  item:
    "px-4 py-2.5 font-bold text-white hover:text-[#D7FF00] hover:bg-[#2A2B31]/50 rounded-lg transition-all duration-200 cursor-pointer",
};

// Helper function to convert hex to RGB for shadow generation
function hexToRgb(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return `${r}, ${g}, ${b}`;
}
