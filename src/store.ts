import { create } from "zustand";

type WindowData = {
    id: string;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
};

type Store = {
    openWindows: WindowData[];
    openApp: (id: string) => void;
    updateWindow: (id, date) => void;
    closeApp: (id: string) => void;
    bringToFront: (id: string) => void;
};

export const useWindowStore = create<Store>((set) => ({
    openWindows: [
        {
            id: "about",
            zIndex: 1,
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 }
        }
    ],

    openApp: (id) =>
        set((state) => {
            const alreadyOpen = state.openWindows.find((w) => w.id === id);
            if (alreadyOpen) return state;

            return {
                openWindows: [
                    ...state.openWindows,
                    {
                        id,
                        zIndex: state.openWindows.length + 1,
                        position: { x: 100, y: 100 },
                        size: { width: 400, height: 300 }
                    }
                ]
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
                        size: data.size ? { ...w.size, ...data.size } : w.size
                    }
                    : w
            )
        })),
    closeApp: (id) =>
        set((state) => ({
            openWindows: state.openWindows.filter((w) => w.id !== id)
        })),
    bringToFront: (id) =>
        set((state) => {
            const current = state.openWindows.find((w) => w.id === id);
            const without = state.openWindows.filter((w) => w.id !== id);

            if (!current) return state;

            return {
                openWindows: [
                    ...without,
                    { ...current, zIndex: state.openWindows.length + 1 }
                ]
            };
        }),
}));
