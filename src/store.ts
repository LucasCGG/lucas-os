// store.ts
import { create } from "zustand";
import { appsRegistry } from "./apps";

export type Rect = { x: number; y: number; width: number; height: number };

type WindowData = {
    id: string;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isMinimized?: boolean;
    isFullscreen?: boolean;

    // --- NEW: animation state ---
    isLaunching?: boolean; // currently doing open animation
    isAnimating?: boolean; // any active window animation (open/minimize/etc)
    launchFrom?: Rect | null; // source rect (icon) in desktop coords
    minimizeTo?: Rect | null; // optional: for future minimize-to-icon
};

type Store = {
    openWindows: WindowData[];
    highestZIndex: number;

    openApp: (id: string, opts?: { sourceRect?: Rect | null }) => void;
    updateWindow: (id: string, data: Partial<WindowData>) => void;
    closeApp: (id: string) => void;
    bringToFront: (id: string) => void;
    minimizeApp: (id: string) => void;
    toggleFullscreenApp: (id: string) => void;
};

const MARGIN = 150;

function getRandomPosition(size = { width: 500, height: 400 }) {
    const maxX = window.innerWidth - size.width - 100;
    const maxY = window.innerHeight - size.height - 100;

    return {
        x: Math.floor(Math.random() * Math.max(maxX, 0)),
        y: Math.floor(Math.random() * Math.max(maxY, 0)),
    };
}

function fitSizeToViewport(size: { width: number; height: number }) {
    const availW = Math.max(0, window.innerWidth - MARGIN);
    const availH = Math.max(0, window.innerHeight - MARGIN);

    return {
        width: Math.min(size.width, availW),
        height: Math.min(size.height, availH),
    };
}

export const useWindowStore = create<Store>((set, get) => ({
    openWindows: [
        {
            id: "mail",
            zIndex: 0,
            position: { x: 100, y: 100 },
            size: { width: 1000, height: 650 },
            isMinimized: false,
            isFullscreen: false,
            isLaunching: false,
            isAnimating: false,
            launchFrom: null,
            minimizeTo: null,
        },
    ],
    highestZIndex: 0,

    openApp: (id, opts) =>
        set((state) => {
            const existingWindow = state.openWindows.find((w) => w.id === id);
            const app = appsRegistry[id];
            if (!app) return state;

            const size = fitSizeToViewport(app.defaultSize);
            const position = app.startPosition ?? getRandomPosition(size);
            const nextZ = state.highestZIndex + 1;

            if (existingWindow) {
                return {
                    openWindows: state.openWindows.map((w) =>
                        w.id === id
                            ? {
                                  ...w,
                                  isMinimized: false,
                                  zIndex: nextZ,
                                  isLaunching: false,
                                  isAnimating: false,
                                  launchFrom: opts?.sourceRect ?? w.launchFrom ?? null,
                              }
                            : w
                    ),
                    highestZIndex: nextZ,
                };
            }

            return {
                openWindows: [
                    ...state.openWindows,
                    {
                        id,
                        zIndex: nextZ,
                        position,
                        size,
                        isMinimized: false,
                        isFullscreen: false,
                        isLaunching: !!opts?.sourceRect,
                        isAnimating: !!opts?.sourceRect,
                        launchFrom: opts?.sourceRect ?? null,
                        minimizeTo: null,
                    },
                ],
                highestZIndex: nextZ,
            };
        }),

    updateWindow: (id, data) =>
        set((state) => ({
            openWindows: state.openWindows.map((w) =>
                w.id === id
                    ? {
                          ...w,
                          ...data,
                          position: data.position
                              ? { ...w.position, ...data.position }
                              : w.position,
                          size: data.size ? { ...w.size, ...data.size } : w.size,
                      }
                    : w
            ),
        })),

    closeApp: (id) =>
        set((state) => ({
            openWindows: state.openWindows.filter((w) => w.id !== id),
        })),

    bringToFront: (id) => {
        const { openWindows, highestZIndex } = get();
        const current = openWindows.find((w) => w.id === id);
        if (!current) return;

        const nextZ = highestZIndex + 1;
        set({
            openWindows: openWindows.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w)),
            highestZIndex: nextZ,
        });
    },

    minimizeApp: (id) =>
        set((state) => ({
            openWindows: state.openWindows.map((w) =>
                w.id === id ? { ...w, isMinimized: true } : w
            ),
        })),

    toggleFullscreenApp: (id) =>
        set((state) => ({
            openWindows: state.openWindows.map((w) =>
                w.id === id ? { ...w, isFullscreen: !w.isFullscreen } : w
            ),
        })),
}));
