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
          50: '#ffe0e6',
          100: '#ffa5b9',
          200: '#ff85a2',
          300: '#ff6b8a',
          400: '#ff5172',
          500: '#ff375a',
          600: '#e6314f',
          700: '#cc2b44',
          800: '#b32539',
          900: '#991f2e',
        },
        secondary: {
          50: '#fff8f0',
          100: '#ffe0e6',
          200: '#ffa5b9',
          300: '#ff85a2',
          400: '#ff8e71',
          500: '#e67a60',
          600: '#cc6b54',
          700: '#b35c48',
          800: '#994d3c',
          900: '#803e30',
        },
        cream: '#fff8f0',
        'light-pink': '#ffe0e6',
      },
      fontFamily: {
        'messiri': ['El Messiri', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}