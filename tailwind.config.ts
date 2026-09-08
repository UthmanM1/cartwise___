import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1360px' } },
    extend: {
      colors: {
        // Editorial commerce palette — ink / paper / signal amber.
        // Deliberately NOT the purple/violet AI-SaaS palette.
        ink: {
          950: '#0d0d0c',
          900: '#161615',
          800: '#232321',
          700: '#3a3a37',
          600: '#54534f',
          500: '#726f68',
          400: '#95928a',
          300: '#b8b4ab',
          200: '#dbd7cd',
          100: '#ece9e1',
          50: '#f7f5ef',
        },
        paper: '#faf8f3',
        signal: {
          DEFAULT: '#c9542c',
          50: '#fdf3ee',
          100: '#f9e0d2',
          400: '#e08256',
          500: '#c9542c',
          600: '#a84322',
          700: '#82341b',
        },
        good: { 50: '#eef6ee', 500: '#3f7d42', 600: '#2f5e32' },
        warn: { 50: '#fbf3e4', 500: '#b3791b' },
        bad: { 50: '#fbeeee', 500: '#a33a3a' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { sm: '2px', DEFAULT: '4px', md: '6px', lg: '8px' },
      boxShadow: {
        card: '0 1px 2px rgba(13,13,12,0.06), 0 1px 0 rgba(13,13,12,0.04)',
        pop: '0 8px 30px rgba(13,13,12,0.12)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
