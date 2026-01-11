/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // pzm.ae brand palette
        primary: '#00A76F', // Brand Green (from logo)
        secondary: '#161C24', // Dark Gray
        brandLight: '#F0F6FF',
        brandTextDark: '#333333',
        brandTextMedium: '#666666',
        brandBorder: '#E0E0E0',
        brandGreen: '#00A76F', // Same as primary
        brandGreenDark: '#16a34a', // Darker green for hover/active
        brandRed: '#DC3545',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
