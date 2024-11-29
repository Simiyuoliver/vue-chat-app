/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const interFont = require('tailwindcss-font-inter')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#E0E0E0',
          secondary: '#A0A0A0',
          900: '#121212',
          800: '#1E1E1E',
          700: '#2A2A2A',
          600: '#3A3A3A'
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      },
      boxShadow: {
        'dark-lg': '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)'
      }
    },
  },
  plugins: [
    interFont
  ],
}
