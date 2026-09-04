/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--duk-brand) / <alpha-value>)',
          50: 'rgb(var(--duk-brand-50) / <alpha-value>)',
          100: 'rgb(var(--duk-brand-100) / <alpha-value>)',
          200: 'rgb(var(--duk-brand-200) / <alpha-value>)',
          300: 'rgb(var(--duk-brand-300) / <alpha-value>)',
          400: 'rgb(var(--duk-brand-400) / <alpha-value>)',
          500: 'rgb(var(--duk-brand-500) / <alpha-value>)',
          600: 'rgb(var(--duk-brand-600) / <alpha-value>)',
          700: 'rgb(var(--duk-brand-700) / <alpha-value>)',
          800: 'rgb(var(--duk-brand-800) / <alpha-value>)',
          900: 'rgb(var(--duk-brand-900) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--duk-primary) / <alpha-value>)',
          light: 'rgb(var(--duk-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--duk-primary-dark) / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        surface: 'rgb(var(--duk-surface) / <alpha-value>)',
        canvas: 'rgb(var(--duk-canvas) / <alpha-value>)',
        ink: 'rgb(var(--duk-ink) / <alpha-value>)',
        muted: 'rgb(var(--duk-muted) / <alpha-value>)',
        line: 'rgb(var(--duk-line) / <alpha-value>)',
        danger: '#DC2626',
        success: 'rgb(var(--duk-success) / <alpha-value>)',
        emerald: {
          50: 'rgb(var(--duk-emerald-50) / <alpha-value>)',
          100: 'rgb(var(--duk-emerald-100) / <alpha-value>)',
          200: 'rgb(var(--duk-emerald-200) / <alpha-value>)',
          300: 'rgb(var(--duk-emerald-300) / <alpha-value>)',
          400: 'rgb(var(--duk-emerald-400) / <alpha-value>)',
          500: 'rgb(var(--duk-emerald-500) / <alpha-value>)',
          600: 'rgb(var(--duk-emerald-600) / <alpha-value>)',
          700: 'rgb(var(--duk-emerald-700) / <alpha-value>)',
          800: 'rgb(var(--duk-emerald-800) / <alpha-value>)',
          900: 'rgb(var(--duk-emerald-900) / <alpha-value>)',
        },
        // Duka Store dashboard brand palette. New dashboard-only tokens so we
        // never disturb the Front Store (which keeps its own --sf-* variables).
        // Use these tokens for the authenticated Dashboard/POS application only.
        duka: {
          brand: '#F28C18',
          'brand-dark': '#D96F00',
          ink: '#0B0B0B',
          charcoal: '#3D4145',
          white: '#FFFFFF',
          50: '#FEF6EC',
          100: '#FDEAD2',
          200: '#FBD6A5',
          300: '#F8BD6E',
          400: '#F5A43C',
          500: '#F28C18',
          600: '#D96F00',
          700: '#B85900',
          800: '#8A4400',
          900: '#633000',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(23 32 27 / 0.05), 0 1px 3px 0 rgb(23 32 27 / 0.04)',
        pop: '0 4px 16px -2px rgb(23 32 27 / 0.12)',
      },
    },
  },
  plugins: [],
};
