/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Onyx / charcoal foundation
        onyx: {
          950: '#0a0a0b',
          900: '#101012',
          850: '#16161a',
          800: '#1c1c21',
          700: '#26262d',
          600: '#34343d',
        },
        // Warm brushed gold
        gold: {
          50: '#fbf6e9',
          100: '#f3e6c2',
          200: '#e7cd8c',
          300: '#d8b25a',
          400: '#c79a3a',
          500: '#b9882a',
          600: '#9c6f20',
        },
        bone: '#f4efe6',
        ash: '#9a958c',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        ultra: '0.32em',
      },
      maxWidth: {
        shell: '1240px',
      },
      boxShadow: {
        gold: '0 18px 60px -20px rgba(199, 154, 58, 0.45)',
        lift: '0 30px 80px -30px rgba(0, 0, 0, 0.8)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pole: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 -56px' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        pole: 'pole 1.1s linear infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
