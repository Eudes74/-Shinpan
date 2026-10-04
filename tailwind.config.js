/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#0a1020', panel: '#111b2d', line: '#26344a', primary: '#6366f1'
      },
      boxShadow: { glow: '0 0 36px rgba(99,102,241,.14)' }
    }
  },
  plugins: []
};
