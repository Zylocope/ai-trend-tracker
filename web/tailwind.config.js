/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        ink:   '#080b0f',
        paper: '#0f1419',
        card:  '#151c24',
        edge:  '#1e2a36',
        amber: { DEFAULT: '#e8a230', dim: '#7a531a' },
        ice:   { DEFAULT: '#7ec8e3', dim: '#2a4f5e' },
        rose:  { DEFAULT: '#e87c7c', dim: '#5e2a2a' },
        lime:  { DEFAULT: '#82d98a', dim: '#2a5e30' },
        muted: '#4a6070',
        soft:  '#8ba5b8',
        bright:'#ddeeff',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.7)' },
        },
      },
    },
  },
  plugins: [],
}
