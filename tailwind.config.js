/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        suit: {
          hearts: '#e11d48',
          diamonds: '#2563eb',
          clubs: '#16a34a',
          spades: '#475569',
        },
        card: {
          bg: '#1e293b',
          border: '#334155',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
