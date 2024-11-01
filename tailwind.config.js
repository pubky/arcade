import colors from 'tailwindcss/colors';

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
      'secondary-pink': '#73006A',
      'action-blue': '#213CE2',
      'neutral-blue': '#141439',
      'primary-green': '#35AF92',
      'primary-gray': '#222237',
    }
  },
  plugins: [],
}