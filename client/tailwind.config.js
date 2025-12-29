/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00D26A',
        'primary-dark': '#00B85A',
        'primary-light': '#33DD89',
      },
    },
  },
  plugins: [],
}
