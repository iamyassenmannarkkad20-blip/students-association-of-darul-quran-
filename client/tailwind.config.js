/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          50: '#FDF5F3', 100: '#F7E4DF', 200: '#EBC7BE', 300: '#DDA397',
          400: '#CB7969', 500: '#B95445', 600: '#A83A27', 700: '#8E2D27',
          800: '#7A211F', 900: '#641B1C', 950: '#4B1718',
        },
        navy: {
          50: '#F8F5F0', 100: '#F0E8DF', 200: '#E3D2C1', 300: '#CBAF95',
          400: '#A9846B', 500: '#805B4A', 600: '#67463B', 700: '#51352F',
          800: '#3B2825', 900: '#29201E', 950: '#191615',
        },
        gold: {
          50: '#FFF9EC', 100: '#F8EDCF', 200: '#F0DCA7', 300: '#E6C779',
          400: '#DDB65E', 500: '#D6A64F', 600: '#B9852C', 700: '#94661F',
          800: '#67451A', 900: '#422D1B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
