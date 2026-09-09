/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: {
          50: '#f1f7f3',
          100: '#deeee3',
          200: '#bcdec9',
          300: '#90c6a7',
          400: '#61a87f',
          500: '#3f8b61',
          600: '#2f6f4d',
          700: '#265940',
          800: '#203f2f',
          900: '#143a2a',
          950: '#0c2218',
        },
        sand: {
          50: '#fbf8f1',
          100: '#f6eede',
          200: '#ecdcb8',
          300: '#e1c58d',
          400: '#d6ac62',
          500: '#c99745',
          600: '#b27d38',
          700: '#94622f',
          800: '#7a502d',
          900: '#664228',
          950: '#3b2414',
        },
        graphite: {
          50: '#f6f6f7',
          100: '#e7e7ea',
          200: '#d2d2d7',
          300: '#b0b0b8',
          400: '#888894',
          500: '#6d6d7a',
          600: '#5e5e6b',
          700: '#4b4b55',
          800: '#34343c',
          900: '#26262d',
          950: '#17171c',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -6px rgba(12, 34, 24, 0.12)',
        lift: '0 18px 40px -12px rgba(12, 34, 24, 0.28)',
        glow: '0 0 0 1px rgba(63, 139, 97, 0.4), 0 12px 32px -8px rgba(63, 139, 97, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}