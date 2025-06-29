import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        sans: ["system-ui", "sans-serif"],
      },
      borderRadius: {
        'xs': '6px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'smooth': '14px',
        'card': '20px',
        'button': '16px',
        'input': '14px',
        'dialog': '24px',
        'menu': '18px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'smooth-hover': 'smooth-hover 0.3s ease-in-out',
        'card-hover': 'card-hover 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'button-press': 'button-press 0.1s ease-in-out',
      },
      keyframes: {
        'smooth-hover': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        'card-hover': {
          '0%': { 
            transform: 'translateY(0px) scale(1)',
            borderRadius: '20px'
          },
          '100%': { 
            transform: 'translateY(-4px) scale(1.01)',
            borderRadius: '24px'
          },
        },
        'button-press': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'smooth': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'card': '0 8px 20px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'button': '0 6px 16px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-hover': '0 0 30px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config;
