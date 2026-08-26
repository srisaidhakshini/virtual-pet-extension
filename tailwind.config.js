/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./sidepanel.html",
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          pink: "#ff758f",
          "pink-light": "#fff0f3",
          "pink-border": "#ffb3c1",
          yellow: "#ffc078",
          "yellow-light": "#fff9db",
          purple: "#b197fc",
          "purple-light": "#f3f0ff",
          green: "#38d9a9",
          "green-light": "#e6fcf5",
          bg: "#fffdfa",
          card: "#ffffff",
          text: "#2d232e",
          subtext: "#7a6b7d",
          border: "#2d232e",
          "border-light": "#ebdce6",
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace']
      },
      boxShadow: {
        'cozy': '0 4px 14px 0 rgba(0, 0, 0, 0.06)',
        'cozy-hover': '0 6px 20px 0 rgba(0, 0, 0, 0.1)',
        'cozy-card': '0 2px 8px rgba(45, 35, 46, 0.08)',
        'pixel': '2px 2px 0px #2d232e',
        'pixel-lg': '4px 4px 0px #2d232e',
      },
      borderRadius: {
        'cozy': '20px',
        'cozy-lg': '28px',
      }
    },
  },
  plugins: [],
}
