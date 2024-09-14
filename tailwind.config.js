const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      ...colors,
      'primary-blue': '#030321',
      'primary-pink': '#D900C8',
      'secondary-blue': '#1C1C43',
    }
  },
  plugins: [],
}

