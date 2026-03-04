/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10141a',
        mist: '#f7f8fa',
        line: '#d5dbe5',
        accent: '#0f766e',
        accentSoft: '#ccfbf1'
      }
    }
  },
  plugins: []
};