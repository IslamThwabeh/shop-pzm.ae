/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        brandLight: 'var(--brand-light)',
        brandTextDark: 'var(--brand-text-dark)',
        brandTextMedium: 'var(--brand-text-medium)',
        brandBorder: 'var(--brand-border)',
        brandGreen: 'var(--primary-color)',
        brandGreenDark: '#008f5f',
        brandRed: '#DC3545',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
