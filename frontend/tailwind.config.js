/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#00D4AA',
          secondary: '#7C6FF0',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          bg: '#0A1628',
          card: '#1A2742',
          text: '#F8FAFB',
          muted: '#8892A0',
          gold: '#FFB547',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        mono: ['JetBrainsMono'],
        sans: ['Inter'],
      },
    },
  },
  plugins: [],
};
