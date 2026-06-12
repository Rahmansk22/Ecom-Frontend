/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f6fa',
          100: '#e9edf5',
          200: '#c7d2e7',
          300: '#a5b8d9',
          400: '#6283bd',
          500: '#1e4ea1', // Sleek Blue
          600: '#1b4691',
          700: '#173b7a',
          800: '#122e5f',
          900: '#0f264e',
        },
        amazon: {
          navy: '#131921',
          dark: '#232f3e',
          yellow: '#f3a847',
          orange: '#ff9900',
        },
        flipkart: {
          blue: '#2874f0',
          yellow: '#ffe500',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
