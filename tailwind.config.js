/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: {
            DEFAULT: '#043927', // Deep Emerald Green
            light: '#065f41',
            dark: '#021c13',
          },
          gold: {
            DEFAULT: '#d4af37', // Metallic gold
            light: '#f3e5ab',
            dark: '#997a00',
          },
          cream: '#fdfbf7',
        }
      },
      borderRadius: {
        'sm': '12px',
        'DEFAULT': '16px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '24px',
        '3xl': '24px',
      },
      backgroundImage: {
        'marble': "url('/textures/dark-marble.webp')",
        'gold-gradient': "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
