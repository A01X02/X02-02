/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF3EE',
          100: '#F5E6D9',
          200: '#EDCDB8',
          300: '#E8A87C',
          400: '#D88E5F',
          500: '#C77447',
          600: '#A85A35',
          700: '#874528',
          800: '#633420',
          900: '#422515',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#ECF0F1',
          200: '#D5DBDB',
          300: '#BDC3C7',
          400: '#95A5A6',
          500: '#7F8C8D',
          600: '#5F6F70',
          700: '#4A5758',
          800: '#2C3E50',
          900: '#1A252F',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
