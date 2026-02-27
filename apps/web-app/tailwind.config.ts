import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Awesome CV uses Roboto for headers
        header: ['Roboto', 'sans-serif'],
        // Source Sans Pro (Source Sans 3) for body
        body: ['Source Sans 3', 'Source Sans Pro', 'sans-serif'],
      },
      colors: {
        // Awesome CV accent color (can be customized)
        'cv-accent': {
          DEFAULT: '#dc2626', // Red-600
          dark: '#f87171', // Red-400 for better dark mode contrast
        },
        // Dark mode background
        'cv-dark': {
          bg: '#0f172a', // slate-900
          card: '#1e293b', // slate-800
          text: '#e2e8f0', // slate-200
        },
      },
      spacing: {
        // Compact spacing for CV
        'cv-tight': '0.25rem',
        'cv-normal': '0.5rem',
        'cv-relaxed': '0.75rem',
      },
      fontSize: {
        // Exact sizes matching Awesome CV
        'cv-name': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
        'cv-title': [
          '1rem',
          { lineHeight: '1.2', fontWeight: '500', letterSpacing: '0.05em' },
        ],
        'cv-section': ['1.125rem', { lineHeight: '1.2', fontWeight: '700' }],
        'cv-company': ['1rem', { lineHeight: '1.2', fontWeight: '700' }],
        'cv-position': ['0.875rem', { lineHeight: '1.2', fontWeight: '500' }],
        'cv-body': ['0.9375rem', { lineHeight: '1.4' }],
        'cv-small': ['0.8125rem', { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
