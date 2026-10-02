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
        'dialog-pop': {
          '0%': { scale: '0.85', opacity: '0' },
          '100%': { scale: '1', opacity: '1' },
        },
        'dialog-shake': {
          '0%, 100%': { translate: '0 0' },
          '20%': { translate: '-8px 2px' },
          '40%': { translate: '7px -3px' },
          '60%': { translate: '-5px 3px' },
          '80%': { translate: '4px -1px' },
        },
      },
      animation: {
        'spin-center': 'spin-center 1.5s linear infinite',
        'dialog-pop': 'dialog-pop 120ms ease-out',
        'dialog-shake': 'dialog-shake 0.35s linear 2',
        'dialog-pop-shake': 'dialog-pop 120ms ease-out, dialog-shake 0.35s linear 120ms 2',
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
        terminal_background: "#000000",
        terminal_foreground: "#00FF00",
        primary: '#5D341A',
        accent_blue: '#A1B094',
        accent_orange: '#ED9965',
        accent_yellow: '#F3CD8D',
        bg_green: '#90a88d',
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
