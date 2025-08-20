/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'spin-center': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
      },
      animation: {
        'spin-center': 'spin-center 1.5s linear infinite',
      },
      cursor: {
        arrow: 'url("/assets/cursors/arrow.png") 0 0, auto',
        hand: 'url("/assets/cursors/hand.png") 8 2, pointer',
        text: 'url("/assets/cursors/text.png") 8 12, text',
        wait: 'url("/assets/cursors/wait.png") 12 12, wait',
        move: 'url("/assets/cursors/move.png") 12 12, move',
        ew: 'url("/assets/cursors/resize-ew.png") 12 12, ew-resize',
        ns: 'url("/assets/cursors/resize-ns.png") 12 12, ns-resize',
        nwse: 'url("/assets/cursors/resize-nswe.png") 12 12, nwse-resize',
        nesw: 'url("/assets/cursors/resize-nesw.png") 12 12, nesw-resize',
        download: 'url("/assets/cursors/download.png") 8 8, pointer',
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'monospace'],
        chunky: ['"Chunky Beard"', 'cursive'],
        crisis: ['"Climate Crisis"', 'sans-serif'],
      },
      colors: {
        primary: '#5D341A',
        accent_blue: '#A1B094',
        accent_orange: '#ED9965',
        accent_yellow: '#F3CD8D',
        bg_green: '#89a286',
        border: '#5D341A',
        border_fg: '#353425',
        background: '#F7E5C4',
        sidebar: '#7E4B27',
        text: {
          light: '#fff',
          muted: '#F6E6C3',
          strong: '#2e2e2e',
          dark: '#1E1E1E',
        },
      },
    },
  },
  plugins: [],
};
