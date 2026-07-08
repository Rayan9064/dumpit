/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57524e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09',
        }
      }
    },
  },
  plugins: [],
}
