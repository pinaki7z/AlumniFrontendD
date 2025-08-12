/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
  'flex', 'items-center', 'justify-center', 'h-screen', 'w-screen',
  'bg-white', 'w-12', 'h-12', 'border-4', 'border-blue-500',
  'border-t-transparent', 'rounded-full', 'animate-spin'
],
}

