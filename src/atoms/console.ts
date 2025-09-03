import { create } from "zustand";
import type { Terminal } from "xterm";
import { useEffect } from "react";

type TerminalState = {
    term: Terminal | null;
    setTerm: (t: Terminal | null) => void;

    hijacked: boolean;
    setHijacked: (v: boolean) => void;

    history: string[];
    pushHistory: (cmd: string) => void;
};

export const useTerminalStore = create<TerminalState>((set) => ({
    term: null,
    setTerm: (t) => set({ term: t }),
    hijacked: false,
    setHijacked: (v) => set({ hijacked: v }),
    history: [],
    pushHistory: (cmd) => set((s) => ({ history: [...s.history, cmd.trim()] })),
}));
