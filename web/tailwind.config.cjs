/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif']
      },
      colors: {
        'sf-dark': '#0D1B2A',
        'sf-primary': '#1565C0',
        'sf-cyan': '#00BCD4',
        'sf-light': '#F4F6F8',
        'sf-text': '#1A1A2E'
      }
    }
  },
  plugins: []
};
