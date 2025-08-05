/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ['"Press Start 2P"', 'monospace']
      },
      colors: {
        primary: "#5D341A",
        accent_blue: "#A1B094",
        accent_orange: "#ED9965",
        accent_yellow: "#F3CD8D",
        background: "#F7E5C4",
        sidebar: "#7E4B27",
        text: {
          light: "#fff",
          muted: "#F6E6C3",
          dark: "#1E1E1E",
        },
      },
    },
  },
  plugins: [],
}
