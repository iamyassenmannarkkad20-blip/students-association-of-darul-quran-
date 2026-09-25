/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          50: '#f0f3ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#6366f1',
          500: '#4338ca',
          600: '#1d23a0',
          700: '#0c1b8c',
          800: '#05187d',
          900: '#02167f', // Official SADQ Royal Blue
          950: '#010d52',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#05187d',
          900: '#02167f', // Unified to Official Royal Blue
          950: '#010d52',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FFF9D6',
          200: '#FFF2AD',
          300: '#FFE675',
          400: '#FFD738',
          500: '#ffd014', // Official SADQ Warm Gold
          600: '#d9ad00',
          700: '#a88300',
          800: '#755900',
          900: '#473600',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
