import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#050d1f',
        surf: '#0a1830',
        'surf-light': '#142952',
        card: '#0e1e3d',
        border: '#1a3264',
        accent: {
          DEFAULT: '#F59E0B', // Ámbar Oro Refinería (Invest Oil)
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        warm: {
          DEFAULT: '#f5a623',
          light: '#f7b94e',
          dark: '#c27e0e',
        },
        neon: {
          DEFAULT: '#eaff3f',
          glow: 'rgba(234, 255, 63, 0.4)',
        },
        primary: {
          DEFAULT: '#0f4c81',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0c8de2',
          600: '#0f4c81',
          700: '#025898',
          800: '#064b7d',
          900: '#0b3f68',
        },
        text: {
          DEFAULT: '#ddeeff',
          muted: '#8ca4c8',
          subtle: '#5a7499',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        heading: ['Outfit', 'Syne', 'system-ui', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-accent': '0 0 24px rgba(245, 158, 11, 0.35)',
        'glow-neon': '0 0 24px rgba(234, 255, 63, 0.25)',
        'glow-warm': '0 0 24px rgba(245, 166, 35, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
