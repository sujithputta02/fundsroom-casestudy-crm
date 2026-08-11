/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode surfaces
        'light-bg': '#ffffff',
        'light-sidebar': '#f5f5f7',
        'light-card': '#f9f9fb',
        'light-card-hover': '#efeff3',
        'light-input': '#ffffff',
        
        // Dark mode surfaces
        'dark-bg': '#0a0a0d',
        'dark-sidebar': '#0d0d12',
        'dark-card': '#16161d',
        'dark-card-hover': '#1c1c25',
        'dark-input': '#131318',
        
        // Light borders
        'light-border-subtle': 'rgba(0,0,0,0.05)',
        'light-border': 'rgba(0,0,0,0.10)',
        
        // Dark borders
        'dark-border-subtle': 'rgba(255,255,255,0.06)',
        'dark-border': 'rgba(255,255,255,0.10)',

        // Light text
        'light-text-primary': '#0a0a0d',
        'light-text-secondary': '#666672',
        'light-text-muted': '#a0a0a8',

        // Dark text
        'dark-text-primary': '#f5f5f7',
        'dark-text-secondary': '#9a9aa5',
        'dark-text-muted': '#63636e',

        // Accent
        'accent': '#7c5cff',
        'accent-strong': '#6d4bff',
        'accent-soft': 'rgba(124,92,255,0.16)',
        
        // Status
        'status-positive': '#22c55e',
        'status-warning': '#f59e0b',
        'status-negative': '#ef4444',
        'status-info': '#38bdf8',
      },
      borderRadius: {
        'custom-12': '12px',
        'custom-16': '16px',
        'custom-20': '20px',
      },
      spacing: {
        'gap-card': '16px',
        'padding-card': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['28px', { fontWeight: '700', letterSpacing: '-0.01em' }],
        'eyebrow': ['11px', { fontWeight: '600', letterSpacing: '0.06em' }],
        'kpi': ['32px', { fontWeight: '700', letterSpacing: '-0.02em' }],
        'section': ['16px', { fontWeight: '600' }],
        'body': ['14px', { fontWeight: '400' }],
        'caption': ['12px', { fontWeight: '400' }],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)',
        'glass-rose': 'linear-gradient(160deg, rgba(196,109,140,0.9), rgba(90,60,110,0.9))',
        'glass-teal': 'linear-gradient(160deg, rgba(31,58,52,0.9), rgba(15,30,28,0.9))',
        'glass-pink': 'linear-gradient(160deg, rgba(179,87,122,0.9), rgba(80,40,70,0.9))',
        'glass-blue': 'linear-gradient(160deg, rgba(26,43,79,0.9), rgba(12,20,40,0.9))',
        'glass-orange': 'linear-gradient(160deg, rgba(168,70,31,0.9), rgba(80,30,15,0.9))',
      },
      animation: {
        'shimmer': 'shimmer 1.8s infinite linear',
        'stagger-in': 'staggerIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-over': 'slideOver 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideOver: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

