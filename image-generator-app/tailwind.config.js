/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'aigenr': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Aigenr Primary Colors
        aigenr: {
          page: 'transparent',
          container: 'rgba(255, 255, 255, 0.9)',
          dark: '#1A1A1A',
          green: '#10B981',
          'green-light': '#86EFAC',
          'green-hover': '#059669',
          gray: '#6B7280',
          'gray-light': '#F5F5F5',
          shadow: '#E1D9D3',
          star: '#A7F3D0',
        },
        // Keep some legacy colors for compatibility
        primary: {
          50: '#FFF7F1',
          100: '#86EFAC',
          500: '#10B981',
          600: '#10B981',
        },
        background: {
          main: '#FFF7F1',
          white: '#FFFFFF',
          card: '#FFFFFF',
          hover: '#F5F5F5',
          subtle: '#F5F5F5',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          muted: '#6B7280',
        },
        border: {
          default: '#1A1A1A',
          light: '#1A1A1A',
          focus: '#10B981',
        },
        // Dark mode variants
        'aigenr-dark': {
          page: 'transparent',
          container: 'rgba(45, 45, 45, 0.9)',
          dark: '#FFFFFF',
          green: '#10B981',
          'green-light': '#86EFAC',
          'green-hover': '#059669',
          gray: '#9CA3AF',
          'gray-light': '#374151',
          shadow: '#000000',
          star: '#A7F3D0',
        },
      },
      boxShadow: {
        // Aigenr hard shadows
        'aigenr-hard': '4px 4px 0px #1A1A1A',
        'aigenr-hard-hover': '2px 2px 0px #1A1A1A',
        'aigenr-container': '8px 8px 0px #E1D9D3',
        'aigenr-card': '4px 4px 0px #1A1A1A',
        'aigenr-button': '4px 4px 0px #1A1A1A',
        'aigenr-button-hover': '2px 2px 0px #1A1A1A',
        'aigenr-none': 'none',
      },
      backgroundImage: {
        'aigenr-primary': 'linear-gradient(105deg, #86EFAC 0%, #10B981 100%)',
        'aigenr-accent': 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
        'gradient-primary': 'linear-gradient(105deg, #86EFAC 0%, #10B981 100%)',
        'gradient-primary-hover': 'linear-gradient(105deg, #059669 0%, #10B981 100%)',
        'gradient-page': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      },
      borderWidth: {
        'aigenr': '2px',
      },
      borderRadius: {
        'aigenr': '8px',
        'aigenr-lg': '12px',
        'aigenr-xl': '16px',
        'aigenr-2xl': '24px',
      },
      fontSize: {
        'aigenr-h1': ['72px', { lineHeight: '1.1', fontWeight: '800' }],
        'aigenr-h2': ['48px', { lineHeight: '1.2', fontWeight: '800' }],
        'aigenr-h3': ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        'aigenr-body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      fontWeight: {
        'aigenr-light': '400',
        'aigenr-medium': '500',
        'aigenr-bold': '700',
        'aigenr-black': '800',
      },
      animation: {
        'aigenr-press': 'press 0.1s ease-out',
      },
      keyframes: {
        press: {
          '0%': { transform: 'translate(0px, 0px)', boxShadow: '4px 4px 0px #1A1A1A' },
          '50%': { transform: 'translate(2px, 2px)', boxShadow: '2px 2px 0px #1A1A1A' },
          '100%': { transform: 'translate(4px, 4px)', boxShadow: 'none' },
        },
      },
    },
  },
  plugins: [],
}