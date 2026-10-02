import { create } from "zustand";

export type CrashCause = { kind: "taskmanager" } | { kind: "rm"; file: string };

type CrashState = {
    cause: CrashCause | null;
    crash: (cause: CrashCause) => void;
};

export const useCrashStore = create<CrashState>((set, get) => ({
    cause: null,
    crash: (cause) => {
        if (!get().cause) set({ cause });
    },
}));
