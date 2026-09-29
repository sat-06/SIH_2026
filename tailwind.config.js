/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        app: {
          bg: '#0A0B0D',
          surface: '#111316',
          'surface-2': '#171A1E',
          border: '#23272D',
          text: '#E7E9EC',
          muted: '#8A929C',
          faint: '#5B626B',
        },
        amber: {
          DEFAULT: '#D4A017',
          hover: '#E6B422',
          light: 'rgba(212, 160, 23, 0.1)',
        },
        status: {
          high: '#2FB463',
          medium: '#E5C94B',
          low: '#E5484D',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
