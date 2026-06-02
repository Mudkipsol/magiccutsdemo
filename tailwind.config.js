/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm ink foundation (the dominant base)
        onyx: {
          950: '#0c0b09',
          900: '#100e0c',
          850: '#15120f',
          800: '#1b1714',
          700: '#252019',
          600: '#322b22',
        },
        // Restrained brass — the single sharp accent, used rarely
        gold: {
          50: '#fbf6e9',
          100: '#f3e6c2',
          200: '#e7cd8c',
          300: '#d8b25a',
          400: '#c79a3a',
          500: '#b9882a',
          600: '#9c6f20',
        },
        // Light editorial counter-surface (the bone-paper spread)
        paper: {
          DEFAULT: '#e9e0d0',
          100: '#f1eadd',
          ink: '#1c1813',
          ash: '#574f42',
        },
        bone: '#f3eee3',
        ash: '#8d857a',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        ultra: '0.24em',
      },
      maxWidth: {
        shell: '1280px',
      },
      boxShadow: {
        gold: '0 18px 60px -24px rgba(199, 154, 58, 0.4)',
        lift: '0 40px 90px -40px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        'rule-in': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'rule-in': 'rule-in 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },
  plugins: [],
}
