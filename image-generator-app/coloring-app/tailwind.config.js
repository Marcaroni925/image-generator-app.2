/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#F9F5F6',
        'pastel-blue': '#A7C7E7',
        'pastel-green': '#D7E4BC',
        'pastel-purple': '#C7A7E7',
        'accent-pink': '#FFE6E6',
      },
      fontFamily: {
        'handlee': ['Handlee', 'cursive'],
      },
      animation: {
        'crayon-draw': 'crayon-draw 2s ease-in forwards',
        'pulse-generate': 'pulse-generate 1s infinite',
        'bounce-button': 'bounce-button 0.2s ease-in-out',
        'wobble': 'wobble 2s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-in forwards',
      },
      keyframes: {
        'crayon-draw': {
          'from': { 'stroke-dashoffset': '100' },
          'to': { 'stroke-dashoffset': '0' },
        },
        'pulse-generate': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-button': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'wobble': {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-1px)' },
          '75%': { transform: 'translateY(1px)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}