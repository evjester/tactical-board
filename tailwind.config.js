/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: {
          grass: '#2d5a27',
          lines: '#ffffff',
          dark: '#1e4d1a',
        },
        home: {
          primary: '#dc2626',
          secondary: '#ffffff',
        },
        away: {
          primary: '#2563eb',
          secondary: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
