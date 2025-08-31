import { create } from "zustand";
import type { Terminal } from "xterm";

type TerminalState = {
    term: Terminal | null;
    setTerm: (t: Terminal | null) => void;

    hijacked: boolean;
    setHijacked: (v: boolean) => void;
};

export const useTerminalStore = create<TerminalState>((set) => ({
    term: null,
    setTerm: (t) => set({ term: t }),
    hijacked: false,
    setHijacked: (v) => set({ hijacked: v }),
}));
