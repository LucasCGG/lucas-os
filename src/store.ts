import { create } from 'zustand';

type WindowData = {
  id: string;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized?: boolean;
  isFullscreen?: boolean;
};

type Store = {
  openWindows: WindowData[];
  openApp: (id: string) => void;
  updateWindow: (id, date) => void;
  closeApp: (id: string) => void;
  bringToFront: (id: string) => void;
  minimizeApp: (id: string) => void;
  toggleFullscreenApp: (id: string) => void;
};

export const useWindowStore = create<Store>((set) => ({
  openWindows: [
    {
      id: 'about',
      zIndex: 1,
      position: { x: 100, y: 100 },
      size: { width: 1000, height: 650 },
      isMinimized: false,
      isFullscreen: false,
    },
  ],

  openApp: (id) =>
    set((state) => {
      const existingWindow = state.openWindows.find((w) => w.id === id);

      if (existingWindow) {
        return {
          openWindows: state.openWindows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  isMinimized: false,
                  zIndex: state.openWindows.length + 1,
                }
              : w
          ),
        };
      }

      return {
        openWindows: [
          ...state.openWindows,
          {
            id,
            zIndex: state.openWindows.length + 1,
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 },
            isMinimized: false,
            isFullscreen: false,
          },
        ],
      };
    }),

  updateWindow: (id, data) =>
    set((state) => ({
      openWindows: state.openWindows.map((w) =>
        w.id === id
          ? {
              ...w,
              ...data,
              position: data.position ? { ...w.position, ...data.position } : w.position,
              size: data.size ? { ...w.size, ...data.size } : w.size,
            }
          : w
      ),
    })),

  closeApp: (id) =>
    set((state) => ({
      openWindows: state.openWindows.filter((w) => w.id !== id),
    })),

  bringToFront: (id) =>
    set((state) => {
      const current = state.openWindows.find((w) => w.id === id);
      const without = state.openWindows.filter((w) => w.id !== id);
      if (!current) return state;

      return {
        openWindows: [...without, { ...current, zIndex: state.openWindows.length + 1 }],
      };
    }),

  minimizeApp: (id) =>
    set((state) => ({
      openWindows: state.openWindows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
    })),

  toggleFullscreenApp: (id) =>
    set((state) => ({
      openWindows: state.openWindows.map((w) =>
        w.id === id ? { ...w, isFullscreen: !w.isFullscreen } : w
      ),
    })),
}));
