import type { ReactNode } from "react";
import { create } from "zustand";

export type DialogButtonSpec = {
    label: string;
    onClick?: () => void;
    keepOpen?: boolean;
};

export type DialogSpec = {
    title: string;
    message: ReactNode;
    icon?: ReactNode;
    buttons?: DialogButtonSpec[];
    onClose?: () => void;
    /** Shake once on open. */
    shake?: boolean;
};

export type OpenDialog = DialogSpec & { key: number };

type DialogState = {
    dialogs: OpenDialog[];
    sleeping: boolean;
    open: (spec: DialogSpec) => number;
    close: (key: number) => void;
    setSleeping: (sleeping: boolean) => void;
};

let nextKey = 1;

export const useDialogStore = create<DialogState>((set) => ({
    dialogs: [],
    sleeping: false,
    open: (spec) => {
        const key = nextKey++;
        set((s) => ({ dialogs: [...s.dialogs, { ...spec, key }] }));
        return key;
    },
    close: (key) => set((s) => ({ dialogs: s.dialogs.filter((d) => d.key !== key) })),
    setSleeping: (sleeping) => set({ sleeping }),
}));

export const openDialog = (spec: DialogSpec) => useDialogStore.getState().open(spec);
