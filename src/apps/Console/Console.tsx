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
import { createCommandHandlers, toAbsolutePath } from "../../utils";
import type { CommandOutput } from "../../utils";
import { useFileSystemStore, useTerminalStore } from "../../atoms";

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

    const history = useTerminalStore((s) => s.history);
    const pushHistory = useTerminalStore((s) => s.pushHistory);

    const histIdxRef = useRef<number | null>(null);
    const stashRef = useRef<string | null>(null);

    const pushHistoryIfNeeded = useCallback((cmd: string) => {
        console.debug("cmd", cmd);
        const trimmedCmd = cmd.trim();
        if (trimmedCmd) {
            console.debug("cmd.trim", cmd.trim());
            console.debug("history", useTerminalStore.getState().history);
            pushHistory(trimmedCmd);
        }
    }, []);

    const renderInputLine = useCallback(
        (newLine: string) => {
            if (!instance) return;
            instance.write("\r\x1b[2K");
            instance.write(promptRef.current);
            instance.write(newLine);
            lineRef.current = newLine;
        },
        [instance]
    );

    const startBrowsing = () => {
        if (histIdxRef === null) stashRef.current = lineRef.current;
    };

    const stopBrowsing = () => {
        histIdxRef.current = null;
        stashRef.current = null;
    };

    const navigateHistory = useCallback(
        (delta: number) => {
            if (!instance || history.length === 0) return;

            startBrowsing();
            let nextId: number | null;
            if (histIdxRef.current === null) {
                nextId = delta < 0 ? history.length - 1 : null;
            } else {
                const raw = histIdxRef.current + delta;
                if (raw < 0) nextId = 0;
                else if (raw >= history.length) nextId = null;
                else nextId = raw;
            }

            histIdxRef.current = nextId;

            if (nextId === null) {
                renderInputLine(stashRef.current ?? "");
            } else {
                renderInputLine(history[nextId] ?? "");
            }
        },
        [history, instance, renderInputLine]
    );

    const lcp = (arr: string[]) => {
        if (arr.length === 0) return "";
        let p = arr[0];
        for (let i = 1; i < arr.length; i++) {
            let j = 0;
            const s = arr[i];
            while (j < p.length && j < s.length && p[j] === s[j]) j++;
            p = p.slice(0, j);
            if (!p) break;
        }
        return p;
    };

    const splitTokens = (line: string) => {
        const parts = line.split(/(\s+)/).filter(Boolean);
        const tokens: string[] = [];
        for (let i = 0; i < parts.length; i++) {
            if (!/^\s+$/.test(parts[i])) tokens.push(parts[i]);
        }
        const endsWithSpace = /\s$/.test(line);
        const currentTokenIndex = endsWithSpace ? tokens.length : Math.max(0, tokens.length - 1);
        const currentToken = endsWithSpace ? "" : (tokens[tokens.length - 1] ?? "");
        return { tokens, currentTokenIndex, currentToken, endsWithSpace };
    };

    const splitDirBase = (raw: string) => {
        const idx = raw.lastIndexOf("/");
        if (idx === -1) return { dir: "", base: raw };
        return { dir: raw.slice(0, idx), base: raw.slice(idx + 1) };
    };

    const listDirEntriesForPathString = (rawPath: string): string[] => {
        const fs = useFileSystemStore.getState();
        const { dir } = splitDirBase(rawPath);
        const dirStr = dir || ".";

        const absDir = toAbsolutePath(dirStr);
        const node = fs.resolvePath(absDir);
        if (!node || node.type !== "directory" || !node.children) return [];
        return Object.keys(node.children);
    };

    const completePathToken = (
        rawPathToken: string
    ): { prefix: string; candidates: string[]; dirPrefix: string } => {
        const { dir, base } = splitDirBase(rawPathToken);
        const entries = listDirEntriesForPathString(rawPathToken);
        const candidates = entries.filter((name) => name.startsWith(base));
        return { prefix: base, candidates, dirPrefix: dir };
    };

    const replaceCurrentToken = (line: string, replacement: string) => {
        const { tokens, currentTokenIndex, endsWithSpace } = splitTokens(line);
        if (tokens.length === 0) return replacement;
        if (currentTokenIndex >= tokens.length) {
            return line + replacement;
        }
        const before = tokens.slice(0, currentTokenIndex).join(" ");
        const after = tokens.slice(currentTokenIndex + 1).join(" ");
        return [before, replacement, after].filter(Boolean).join(" ").replace(/\s+$/, "");
    };

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

        let escBuf = "";

        const renderInputLine = (newLine: string) => {
            instance.write("\r\x1b[2K");
            instance.write(promptRef.current);
            instance.write(newLine);
            lineRef.current = newLine;
        };

        const disp = instance.onData(async (data) => {
            if (useTerminalStore.getState().hijacked) return;

            for (const ch of data) {
                if (escBuf || ch === "\x1b") {
                    escBuf += ch;
                    if (escBuf.length === 3) {
                        if (escBuf === "\x1b[A") {
                            navigateHistory(-1);
                        } else if (escBuf === "\x1b[B") {
                            navigateHistory(+1);
                        }
                        escBuf = "";
                    }
                    if (escBuf.length > 5) escBuf = "";
                    continue;
                }

                if (ch === "\x10") {
                    navigateHistory(-1);
                    continue;
                }

                if (ch === "\x0e") {
                    navigateHistory(+1);
                    continue;
                }

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
                            if (result != null) {
                                for (const line of result.toString().split("\n"))
                                    instance.writeln(line);
                            }
                        } else {
                            instance.writeln("Aborted.");
                        }

                        dispatch({ type: "END_CONFIRM" });
                        dispatch({ type: "SET_PROMPT", prompt: restore });

                        stopBrowsing();

                        instance.write(restore);
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
                    const trimmed = input.trim();

                    if (trimmed.length === 0) {
                        instance.write("\r\n");
                        if (!busyRef.current) instance.write(promptRef.current);
                        lineRef.current = "";
                        stopBrowsing();
                        continue;
                    }

                    if (busyRef.current) {
                        dispatch({ type: "QUEUE_CMD", cmd: input });
                        lineRef.current = "";
                        stopBrowsing();
                        continue;
                    }

                    instance.write("\r\n");
                    lineRef.current = "";

                    if (trimmed) pushHistory(trimmed);
                    stopBrowsing();

                    await runCommand(input);
                    instance.write(promptRef.current);
                    continue;
                }

                if (ch === "\x7f") {
                    if (lineRef.current.length > 0) {
                        instance.write("\b \b");
                        lineRef.current = lineRef.current.slice(0, -1);
                    }

                    if (histIdxRef.current !== null) stopBrowsing();
                    continue;
                }

                if (ch >= " " && ch !== "\x7f") {
                    instance.write(ch);
                    lineRef.current += ch;
                    if (histIdxRef.current !== null) stopBrowsing();
                }
                if (ch === "\t") {
                    const input = lineRef.current;
                    const { tokens, currentTokenIndex, currentToken, endsWithSpace } =
                        splitTokens(input);

                    const commandNames = Object.keys(handlers);
                    const isCompletingCommand = currentTokenIndex === 0 && !endsWithSpace;

                    if (isCompletingCommand) {
                        const matches = commandNames.filter((c) => c.startsWith(currentToken));
                        if (matches.length === 0) {
                            instance.write("\x07");
                        } else if (matches.length === 1) {
                            renderInputLine(replaceCurrentToken(input, matches[0]));
                        } else {
                            const common = lcp(matches);
                            if (common.length > currentToken.length) {
                                renderInputLine(replaceCurrentToken(input, common));
                            } else {
                                instance.write("\r\n");
                                matches.forEach((m) => instance.writeln(m));
                                instance.write(promptRef.current + lineRef.current);
                            }
                        }
                        continue;
                    }

                    const cmd = (tokens[0] ?? "").trim();
                    const fileyCommands = new Set([
                        "ls",
                        "cd",
                        "cat",
                        "rm",
                        "vim",
                        "xdg-open",
                        "open",
                        "touch",
                        "mkdir",
                    ]);

                    if (!cmd || !fileyCommands.has(cmd)) {
                        if (currentToken.includes("/") || currentToken.startsWith("~")) {
                            const { prefix, candidates, dirPrefix } =
                                completePathToken(currentToken);
                            if (candidates.length === 0) {
                                instance.write("\x07");
                            } else if (candidates.length === 1) {
                                const full = dirPrefix
                                    ? `${dirPrefix}/${candidates[0]}`
                                    : candidates[0];
                                renderInputLine(replaceCurrentToken(input, full));
                            } else {
                                const common = lcp(candidates);
                                const next =
                                    common.length > prefix.length
                                        ? dirPrefix
                                            ? `${dirPrefix}/${common}`
                                            : common
                                        : null;
                                if (next) {
                                    renderInputLine(replaceCurrentToken(input, next));
                                } else {
                                    instance.write("\r\n");
                                    candidates.forEach((m) => instance.writeln(m));
                                    instance.write(promptRef.current + lineRef.current);
                                }
                            }
                        } else {
                            instance.write("\x07");
                        }
                        continue;
                    }

                    const { prefix, candidates, dirPrefix } = completePathToken(currentToken);
                    if (candidates.length === 0) {
                        instance.write("\x07");
                    } else if (candidates.length === 1) {
                        const full = dirPrefix ? `${dirPrefix}/${candidates[0]}` : candidates[0];
                        renderInputLine(replaceCurrentToken(input, full));
                    } else {
                        const common = lcp(candidates);
                        const next =
                            common.length > prefix.length
                                ? dirPrefix
                                    ? `${dirPrefix}/${common}`
                                    : common
                                : null;
                        if (next) {
                            renderInputLine(replaceCurrentToken(input, next));
                        } else {
                            instance.write("\r\n");
                            candidates.forEach((m) => instance.writeln(m));
                            instance.write(promptRef.current + lineRef.current);
                        }
                    }
                    continue;
                }
            }
        });

        return () => disp.dispose();
    }, [instance, history, pushHistory, runCommand, writePrompt]);

    useEffect(() => {
        if (!instance) return;
        if (!state.pendingCmd) return;
        if (state.busy) return;
        (async () => {
            instance.write("\r\n");
            const queued = state.pendingCmd;
            dispatch({ type: "CLEAR_QUEUE" });
            if (!queued) return;
            pushHistoryIfNeeded(queued);
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
