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
        card: '#0e1e3d',
        border: '#1a3264',
        accent: {
          DEFAULT: '#00c9a7',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#00c9a7',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
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
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Syne', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-accent': '0 0 24px rgba(0, 201, 167, 0.25)',
        'glow-neon': '0 0 24px rgba(234, 255, 63, 0.25)',
        'glow-warm': '0 0 24px rgba(245, 166, 35, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
      },
    },
  },
  plugins: [],
}

export default config
