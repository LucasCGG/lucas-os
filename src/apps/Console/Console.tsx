import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { useXTerm } from "react-xtermjs";
import { FitAddon } from "xterm-addon-fit";
import { playRandomLoader } from "../../utils/loaderAnimations";
import { createCommandHandlers } from "../../utils";
import type { CommandOutput } from "../../utils";
import { useTerminalStore } from "../../atoms";

type ConfirmState = {
    pending: boolean;
    perform?: () => string | Promise<string>;
    restorePrompt?: string;
};

type ConsoleState = {
    prompt: string;
    busy: boolean;
    pendingCmd: string | null;
    confirm: ConfirmState;
};

type Action =
    | { type: "SET_PROMPT"; prompt: string }
    | { type: "SET_BUSY"; busy: boolean }
    | { type: "QUEUE_CMD"; cmd: string }
    | { type: "CLEAR_QUEUE" }
    | { type: "START_CONFIRM"; perform?: () => string | Promise<string>; restorePrompt?: string }
    | { type: "END_CONFIRM" };

const initialState: ConsoleState = {
    prompt: "> ",
    busy: true,
    pendingCmd: null,
    confirm: { pending: false },
};

function reducer(state: ConsoleState, action: Action): ConsoleState {
    switch (action.type) {
        case "SET_PROMPT":
            return { ...state, prompt: action.prompt };
        case "SET_BUSY":
            return { ...state, busy: action.busy };
        case "QUEUE_CMD":
            return { ...state, pendingCmd: action.cmd };
        case "CLEAR_QUEUE":
            return { ...state, pendingCmd: null };
        case "START_CONFIRM":
            return {
                ...state,
                confirm: {
                    pending: true,
                    perform: action.perform,
                    restorePrompt: action.restorePrompt,
                },
            };
        case "END_CONFIRM":
            return { ...state, confirm: { pending: false } };
        default:
            return state;
    }
}

export const Console: React.FC = () => {
    const { instance, ref } = useXTerm();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const startedRef = useRef(false);

    const lineRef = useRef("");
    const promptRef = useRef(initialState.prompt);

    const [state, dispatch] = useReducer(reducer, initialState);
    const busyRef = useRef(state.busy);
    const confirmRef = useRef<ConfirmState>(state.confirm);

    const [duckCount, setDuckCount] = useState<number>(0);
    const [duckMode, setDuckMode] = useState<boolean>(false);
    const [duckModeActivatedAt, setDuckModeActivatedAt] = useState<number | null>(null);

    useEffect(() => {
        busyRef.current = state.busy;
    }, [state.busy]);
    useEffect(() => {
        confirmRef.current = state.confirm;
    }, [state.confirm]);
    useEffect(() => {
        promptRef.current = state.prompt;
    }, [state.prompt]);

    const handlers = useMemo(
        () =>
            createCommandHandlers({
                duckCount,
                setDuckCount,
                duckMode,
                setDuckMode,
                duckModeActivatedAt,
                setDuckModeActivatedAt,
            }),
        [
            duckCount,
            setDuckCount,
            duckMode,
            setDuckMode,
            duckModeActivatedAt,
            setDuckModeActivatedAt,
        ]
    );
    const writePrompt = useCallback(() => {
        instance?.write(promptRef.current);
    }, [instance]);

    const printLines = useCallback(
        (text: string | undefined | null) => {
            if (!instance || text == null) return;
            for (const line of text.toString().split("\n")) instance.writeln(line);
        },
        [instance]
    );

    const runCommand = useCallback(
        async (raw: string) => {
            if (!instance) return;
            const trimmed = raw.trim();
            if (!trimmed) return;

            const [cmd, ...args] = trimmed.split(/\s+/);
            const handler = handlers[cmd as keyof typeof handlers] as
                | ((args: string[]) => CommandOutput | Promise<CommandOutput>)
                | undefined;

            if (!handler) {
                instance.writeln(`Command "${cmd}" not found`);
                return;
            }

            const output = await Promise.resolve(handler(args));

            if (output === "__CLEAR__") {
                instance.clear();
                return;
            }

            if (typeof output === "object" && (output as any)?.type === "confirm") {
                const oldPrompt = promptRef.current;
                dispatch({
                    type: "START_CONFIRM",
                    perform: (output as any).perform,
                    restorePrompt: oldPrompt,
                });
                dispatch({ type: "SET_PROMPT", prompt: "" });
                instance.writeln((output as any).message ?? "Are you sure?");
                instance.write("> ");
                return;
            }

            printLines(output as string);
        },
        [handlers, instance, printLines]
    );

    useEffect(() => {
        if (!instance) return;

        useTerminalStore.getState().setTerm(instance);
        return () => useTerminalStore.getState().setTerm(null);
    }, [instance]);

    useLayoutEffect(() => {
        if (!instance || !ref.current || startedRef.current) return;

        startedRef.current = true;

        try {
            instance.options.theme = {
                background: "#000000",
                foreground: "#00FF00",
                cursor: "#00FF00",
            };
            instance.options.fontFamily = "'Fira Code', 'Cascadia Code', monospace";
            instance.options.fontSize = 16;
            instance.options.cursorBlink = true;
        } catch {}

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        instance.loadAddon(fitAddon);

        const doFit = () => {
            try {
                fitAddonRef.current?.fit();
            } catch {}
        };

        requestAnimationFrame(doFit);

        if (containerRef.current && typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => doFit());
            ro.observe(containerRef.current);
            resizeObserverRef.current = ro;
        }

        const onWindowResize = () => doFit();
        window.addEventListener("resize", onWindowResize);

        (async () => {
            dispatch({ type: "SET_BUSY", busy: true });
            try {
                await playRandomLoader(instance, writePrompt, 100);
            } finally {
                dispatch({ type: "SET_BUSY", busy: false });
            }
            writePrompt();
        })();

        return () => {
            window.removeEventListener("resize", onWindowResize);
            resizeObserverRef.current?.disconnect();
        };
    }, [instance, ref, writePrompt]);

    useLayoutEffect(() => {
        if (!instance) return;

        const onDataDisp = instance.onData(async (data) => {
            if (useTerminalStore.getState().hijacked) return;

            for (const ch of data) {
                if (confirmRef.current.pending) {
                    if (ch === "\x7f") {
                        if (lineRef.current.length > 0) {
                            instance.write("\b \b");
                            lineRef.current = lineRef.current.slice(0, -1);
                        }
                        continue;
                    }
                    if (ch === "\r") {
                        const answer = lineRef.current.trim().toLowerCase();
                        lineRef.current = "";
                        const yes = answer === "y" || answer === "yes";
                        const no = answer === "n" || answer === "no";

                        if (!yes && !no) {
                            instance.write("\r\nPlease answer Y or N.\r\n> ");
                            continue;
                        }

                        instance.write("\r\n");
                        const restore = confirmRef.current.restorePrompt || "> ";
                        if (yes && confirmRef.current.perform) {
                            const result = await Promise.resolve(confirmRef.current.perform());
                            printLines(result);
                        } else {
                            instance.writeln("Aborted.");
                        }

                        dispatch({ type: "END_CONFIRM" });
                        dispatch({ type: "SET_PROMPT", prompt: restore });
                        writePrompt();
                        continue;
                    }

                    if (ch >= " " && ch !== "\x7f") {
                        instance.write(ch);
                        lineRef.current += ch;
                    }
                    continue;
                }

                if (ch === "\r") {
                    const input = lineRef.current;
                    if (input.trim().length === 0) {
                        instance.write("\r\n");
                        if (!busyRef.current) writePrompt();
                        lineRef.current = "";
                        continue;
                    }

                    if (busyRef.current) {
                        dispatch({ type: "QUEUE_CMD", cmd: input });
                        lineRef.current = "";
                        continue;
                    }

                    instance.write("\r\n");
                    lineRef.current = "";
                    await runCommand(input);
                    writePrompt();
                    continue;
                }

                if (ch === "\x7f") {
                    if (lineRef.current.length > 0) {
                        instance.write("\b \b");
                        lineRef.current = lineRef.current.slice(0, -1);
                    }
                    continue;
                }

                if (ch >= " " && ch !== "\x7f") {
                    instance.write(ch);
                    lineRef.current += ch;
                }
            }
        });

        return () => onDataDisp.dispose();
    }, [instance, runCommand, writePrompt, printLines]);

    useEffect(() => {
        if (!instance) return;
        if (!state.pendingCmd) return;
        if (state.busy) return;
        (async () => {
            instance.write("\r\n");
            const queued = state.pendingCmd;
            dispatch({ type: "CLEAR_QUEUE" });
            if (!queued) return;
            await runCommand(queued);
            writePrompt();
        })();
    }, [instance, state.pendingCmd, state.busy]);

    return (
        <div
            ref={containerRef}
            className="flex h-full min-h-0 w-full overflow-hidden bg-black pb-16 text-text-light"
        >
            <div ref={ref} className="min-h-0 min-w-0 flex-1 pl-4 pt-4" />
        </div>
    );
};
