/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          bg: '#0F172A',
          card: '#1E293B',
          text: '#F8FAFC',
          muted: '#94A3B8',
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
