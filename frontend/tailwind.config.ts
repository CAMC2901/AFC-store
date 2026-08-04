import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AFC brand palette — semantic CSS variables so surfaces/text adapt to light/dark
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E6C95C',
          dark: '#B8952E',
        },
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        mist: 'rgb(var(--mist) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        charcoal: 'rgb(var(--charcoal) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        overlay: 'rgb(var(--overlay) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.14)',
        gold: '0 8px 24px rgba(212,175,55,0.35)',
        drawer: '-16px 0 48px rgba(0,0,0,0.22)',
      },
      maxWidth: {
        '8xl': '1440px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
      },
      transitionProperty: {
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow, background-image',
      },
    },
  },
  plugins: [],
};

export default config;
