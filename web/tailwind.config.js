/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        body:    ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
