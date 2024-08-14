/** @type {import('tailwindcss').Config} */

import { addDynamicIconSelectors } from '@iconify/tailwind'

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '450px',
        '2xl': '1440px',
      },
      backgroundImage: {
        'arrow-icon': "url('/img/arrow.svg')",
      },
    },
  },
  plugins: [addDynamicIconSelectors()],
}
