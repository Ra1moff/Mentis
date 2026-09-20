/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          dark: '#0D1B2A',
          navy: '#1B263B',
          blue: '#415A77',
          lightBlue: '#778DA9',
          light: '#E0E1DD',
          red: '#D62828',
          green: '#2A9D8F',
          yellow: '#E9C46A',
          orange: '#F4A261'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
