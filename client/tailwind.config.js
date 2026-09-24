/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#102A43',
          900: '#0B1B3D',
          950: '#071026',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FBF5E6',
          200: '#F5E7BD',
          300: '#EED690',
          400: '#E4C25E',
          500: '#D4AF37', // Official SADQ Gold
          600: '#B38F24',
          700: '#8E6E17',
          800: '#6A500F',
          900: '#483508',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
