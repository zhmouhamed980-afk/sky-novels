/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          bg: '#0f0f1a',
          card: '#1a1a2e',
          gold: '#f5a623',
          text: '#e8e8e8',
          reader: '#0d0d14'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        amiri: ['Amiri', 'serif']
      }
    },
  },
  plugins: [],
}
