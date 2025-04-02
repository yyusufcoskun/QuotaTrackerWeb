/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bogazici-blue': '#1E4174',
        'bogazici-light': '#3A6BC5',
        'bogazici-dark': '#0D2046',
      },
    },
  },
  plugins: [],
} 