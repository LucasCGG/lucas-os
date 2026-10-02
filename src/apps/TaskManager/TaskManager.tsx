import { useEffect, useMemo, useReducer, useState } from "react";
import { openDialog, useCrashStore, useWindowStore } from "../../atoms";
import { taskFailedDialog } from "../../components/AppDialog/presets";
import { appsRegistry } from "../../apps";
import { useIsMobile } from "../../hooks";

const HISTORY = 40;
const TICK_MS = 1000;
const TOTAL_RAM_MB = 8192;
const DESKTOP_TITLEBAR_HEIGHT = 40;

type Profile = { cpu: number; ram: number };

const PROFILES: Record<string, Profile> = {
    dungeon: { cpu: 34, ram: 640 },
    browser: { cpu: 12, ram: 1240 },
    console: { cpu: 3, ram: 96 },
    about: { cpu: 4, ram: 210 },
    projects: { cpu: 5, ram: 320 },
    mail: { cpu: 2, ram: 150 },
    pdfviewer: { cpu: 6, ram: 280 },
    SwitcheruGameBecauseNamingConventions: { cpu: 2, ram: 48 },
    taskmanager: { cpu: 4, ram: 72 },
};
const DEFAULT_PROFILE: Profile = { cpu: 5, ram: 128 };

const KERNEL_KEY = "sys:kernel";
const QUACKD_KEY = "sys:quackd";
const DUCKLING_PREFIX = "sys:duckling-";
const MAX_DUCKLINGS = 3;
const MANIFESTO_AT = 5;

const QUACKD_LINES = [
    "quackd respawned with a new PID. Ducks don't die, they molt.",
    "Access denied: quackd is owned by user 'duck'.",
    "quackd spawned a duckling to protect itself.",
    "SIGKILL received. quackd ate it.",
    "quackd has published its manifesto. Please read it.",
    "quackd is load-bearing. Removing it would flood the pond.",
    "You can't kill what was never alive. Quack.",
];

type ProcessKind = "app" | "system" | "duck";

type Process = {
    key: string;
    name: string;
    description: string;
    kind: ProcessKind;
    status: string;
    profile: Profile;
    windowId?: string;
};

type ProcessStats = { pid: number; cpu: number[]; ram: number[] };

type WindowSnapshot = { id: string; zIndex: number; isMinimized?: boolean };

type State = {
    tick: number;
    spawns: number;
    stats: Record<string, ProcessStats>;
    quackKills: number;
    quackBackAt: number;
    ducklings: number;
    message: string | null;
};

type Action =
    | { type: "tick"; windows: WindowSnapshot[] }
    | { type: "ended"; key: string; name: string }
    | { type: "killQuackd" }
    | { type: "killDuckling" };

/* ---- Helpers ---- */

function hash(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function noise(seed: string): number {
    return (hash(seed) % 10_000) / 10_000;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const getProcesses = (windows: WindowSnapshot[], state: State): Process[]  => {
    const topZ = Math.max(-Infinity, ...windows.filter((w) => !w.isMinimized).map((w) => w.zIndex));

    const apps: Process[] = windows.flatMap((w) => {
        const app = (appsRegistry as Record<string, { title: string }>)[w.id];
        if (!app) return [];
        const focused = !w.isMinimized && w.zIndex === topZ;
        const base = PROFILES[w.id] ?? DEFAULT_PROFILE;

        return [
            {
                key: w.id,
                name: `${w.id}.exe`,
                description: app.title,
                kind: "app" as const,
                status: w.isMinimized ? "Suspended" : focused ? "Running (focused)" : "Running",
                profile: w.isMinimized
                    ? { cpu: base.cpu * 0.1, ram: base.ram * 0.7 }
                    : focused
                      ? { cpu: base.cpu * 1.4, ram: base.ram }
                      : base,
                windowId: w.id,
            },
        ];
    });

    const system: Process[] = [
        {
            key: KERNEL_KEY,
            name: "lucasos-kernel",
            description: "LucasOS Kernel",
            kind: "system",
            status: "Running",
            profile: { cpu: 2, ram: 384 },
        },
    ];

    if (state.tick >= state.quackBackAt) {
        system.push({
            key: QUACKD_KEY,
            name: "quackd",
            description: "Duck Daemon",
            kind: "duck",
            status: state.quackKills > 0 ? "Running (annoyed)" : "Running",
            profile: {
                cpu: clamp(1 + state.quackKills * 9, 1, 70),
                ram: 42 + state.quackKills * 64,
            },
        });
    }

    for (let i = 1; i <= state.ducklings; i++) {
        system.push({
            key: `${DUCKLING_PREFIX}${i}`,
            name: "quackd-duckling",
            description: "Duckling",
            kind: "duck",
            status: "Paddling",
            profile: { cpu: 3, ram: 16 },
        });
    }

    return [...apps, ...system];
}

const nextSample = (prev: number, target: number, seed: string, spread: number): number =>{
    const jitter = (noise(seed) - 0.5) * 2 * spread;
    return prev * 0.55 + target * 0.45 + jitter;
}

const advance = (state: State, windows: WindowSnapshot[]): State => {
    const tick = state.tick + 1;
    const processes = getProcesses(windows, { ...state, tick });
    const stats: Record<string, ProcessStats> = {};
    let spawns = state.spawns;

    for (const p of processes) {
        let prev = state.stats[p.key];
        if (!prev) {
            spawns++;
            prev = {
                pid: p.key === KERNEL_KEY ? 1 : 1000 + (hash(`${p.key}:${spawns}`) % 9000),
                cpu: Array(HISTORY).fill(0),
                ram: Array(HISTORY).fill(p.profile.ram),
            };
        }

        const lastCpu = prev.cpu[prev.cpu.length - 1];
        const lastRam = prev.ram[prev.ram.length - 1];
        const seed = `${p.key}:${tick}`;

        const cpu = clamp(
            nextSample(lastCpu, p.profile.cpu, `${seed}:cpu`, p.profile.cpu * 0.6 + 1),
            0,
            100
        );
        const ram = clamp(
            nextSample(lastRam, p.profile.ram, `${seed}:ram`, p.profile.ram * 0.04),
            1,
            TOTAL_RAM_MB
        );

        stats[p.key] = {
            pid: prev.pid,
            cpu: [...prev.cpu.slice(1), cpu],
            ram: [...prev.ram.slice(1), ram],
        };
    }

    return { ...state, tick, spawns, stats };
}

const withoutStats= (stats: Record<string, ProcessStats>, key: string) => {
    const next = { ...stats };
    delete next[key];
    return next;
}

const reducer = (state: State, action: Action): State =>{
    switch (action.type) {
        case "tick":
            return advance(state, action.windows);

        case "ended":
            return {
                ...state,
                stats: withoutStats(state.stats, action.key),
                message: `Ended "${action.name}" (PID ${state.stats[action.key]?.pid ?? "?"}).`,
            };

        case "killQuackd": {
            const kills = state.quackKills + 1;
            return {
                ...state,
                quackKills: kills,
                quackBackAt: state.tick + 2,
                ducklings:
                    kills >= 3 ? Math.min(state.ducklings + 1, MAX_DUCKLINGS) : state.ducklings,
                stats: withoutStats(state.stats, QUACKD_KEY),
                message: QUACKD_LINES[(kills - 1) % QUACKD_LINES.length],
            };
        }

        case "killDuckling": {
            const key = `${DUCKLING_PREFIX}${state.ducklings}`;
            return {
                ...state,
                ducklings: Math.max(0, state.ducklings - 1),
                stats: withoutStats(state.stats, key),
                message: "A duckling was released back into the pond. quackd will remember this.",
            };
        }
    }
}

const initialState: State = {
    tick: 0,
    spawns: 0,
    stats: {},
    quackKills: 0,
    quackBackAt: 0,
    ducklings: 0,
    message: null,
};

/* ---- Components ---- */

interface GraphProps {
    values: number[];
    max: number;
    color: string;
    className?: string;
    filled?: boolean;
}

const Graph = ({ values, max, color, className = "", filled }: GraphProps) => {
    const w = 100;
    const h = 30;
    const points = values
        .map((v, i) => `${(i / (values.length - 1)) * w},${h - (clamp(v, 0, max) / max) * h}`)
        .join(" ");

    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
            {filled && (
                <polygon points={`0,${h} ${points} ${w},${h}`} fill={color} opacity={0.25} />
            )}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

interface UsagePanelProps {
    label: string;
    value: string;
    values: number[];
    max: number;
    color: string;
}

const UsagePanel = ({ label, value, values, max, color }: UsagePanelProps) => (
    <div className="flex min-w-0 flex-1 flex-col rounded border-2 border-[#392107] bg-[#1E1E1E] p-2">
        <div className="flex items-baseline justify-between font-mono text-xs text-[#F6E6C3]">
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
        <div
            className="mt-1 h-16 w-full"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(246,230,195,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(246,230,195,0.08) 1px, transparent 1px)",
                backgroundSize: "10% 25%",
            }}
        >
            <Graph values={values} max={max} color={color} filled className="h-full w-full" />
        </div>
    </div>
);

const sumSeries = (series: number[][]) =>
    Array.from({ length: HISTORY }, (_, i) => series.reduce((acc, s) => acc + (s[i] ?? 0), 0));

const snapshotWindows = (): WindowSnapshot[] =>
    useWindowStore
        .getState()
        .openWindows.map(({ id, zIndex, isMinimized }) => ({ id, zIndex, isMinimized }));

export const TaskManager = () => {
    const openWindows = useWindowStore((s) => s.openWindows);
    const closeApp = useWindowStore((s) => s.closeApp);
    const openApp = useWindowStore((s) => s.openApp);
    const crash = useCrashStore((s) => s.crash);
    const isMobile = useIsMobile();

    const [state, dispatch] = useReducer(reducer, initialState, (s) =>
        advance(s, snapshotWindows())
    );
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        const id = setInterval(
            () => dispatch({ type: "tick", windows: snapshotWindows() }),
            TICK_MS
        );
        return () => clearInterval(id);
    }, []);

    const processes = useMemo(() => getProcesses(openWindows, state), [openWindows, state]);
    const selectedProcess = processes.find((p) => p.key === selected) ?? null;

    const totals = useMemo(() => {
        const all = Object.values(state.stats);
        return {
            cpu: sumSeries(all.map((s) => s.cpu)).map((v) => Math.min(v, 100)),
            ram: sumSeries(all.map((s) => s.ram)),
        };
    }, [state.stats]);

    const cpuNow = totals.cpu[HISTORY - 1];
    const ramNow = totals.ram[HISTORY - 1];

    const endTask = () => {
        const p = selectedProcess;
        if (!p) return;

        if (p.key === KERNEL_KEY) {
            crash({ kind: "taskmanager" });
            return;
        }

        if (p.key === QUACKD_KEY) {
            if (state.quackKills === 0) openDialog(taskFailedDialog());
            if (state.quackKills + 1 === MANIFESTO_AT) {
                openApp("pdfviewer", {
                    props: { fileName: { node: { src: "/files/easter-eggs/duck_manifesto.pdf" } } },
                });
            }
            dispatch({ type: "killQuackd" });
            setSelected(null);
            return;
        }

        if (p.key.startsWith(DUCKLING_PREFIX)) {
            dispatch({ type: "killDuckling" });
            setSelected(null);
            return;
        }

        if (p.windowId) {
            closeApp(p.windowId);
            dispatch({ type: "ended", key: p.key, name: p.description });
            setSelected(null);
        }
    };

    return (
        <div
            className="flex h-full min-h-0 flex-col gap-2 bg-background p-2 text-text-strong"
            style={{ paddingBottom: isMobile ? undefined : DESKTOP_TITLEBAR_HEIGHT + 8 }}
        >
            <div className="flex gap-2">
                <UsagePanel
                    label="CPU"
                    value={`${cpuNow.toFixed(0)}%`}
                    values={totals.cpu}
                    max={100}
                    color="#ED9965"
                />
                <UsagePanel
                    label="Memory"
                    value={`${(ramNow / 1024).toFixed(1)} / ${TOTAL_RAM_MB / 1024} GB`}
                    values={totals.ram}
                    max={TOTAL_RAM_MB}
                    color="#A1B094"
                />
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded border-2 border-[#392107] bg-[#FFF8EA]">
                <table className="w-full border-collapse font-mono text-xs">
                    <thead className="sticky top-0 bg-sidebar text-left text-text-muted">
                        <tr>
                            <th className="px-2 py-1 font-semibold">Name</th>
                            <th className="px-2 py-1 font-semibold">PID</th>
                            <th className="px-2 py-1 font-semibold">Status</th>
                            <th className="px-2 py-1 font-semibold">CPU</th>
                            <th className="px-2 py-1 text-right font-semibold">Memory</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map((p) => {
                            const s = state.stats[p.key];
                            const cpu = s ? s.cpu[HISTORY - 1] : 0;
                            const ram = s ? s.ram[HISTORY - 1] : p.profile.ram;
                            const isSelected = p.key === selected;

                            return (
                                <tr
                                    key={p.key}
                                    onClick={() => setSelected(p.key)}
                                    onDoubleClick={() => p.windowId && openApp(p.windowId)}
                                    className={`clickable border-b border-[#392107]/15 ${
                                        isSelected ? "bg-accent_orange/60" : "hover:bg-[#EAD3A2]"
                                    }`}
                                >
                                    <td className="px-2 py-1">
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-semibold">{p.name}</span>
                                            <span className="text-[10px] opacity-60">
                                                {p.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1 tabular-nums">{s?.pid ?? "…"}</td>
                                    <td className="whitespace-nowrap px-2 py-1">{p.status}</td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center gap-2">
                                            <Graph
                                                values={s?.cpu ?? Array(HISTORY).fill(0)}
                                                max={100}
                                                color={p.kind === "duck" ? "#DBAA55" : "#7E4B27"}
                                                className="h-5 w-16 shrink-0"
                                            />
                                            <span className="w-8 text-right tabular-nums">
                                                {cpu.toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-2 py-1 text-right tabular-nums">
                                        {ram.toFixed(0)} MB
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between gap-2">
                <p
                    className="min-w-0 flex-1 truncate font-mono text-xs"
                    title={state.message ?? ""}
                >
                    {state.message ?? `Processes: ${processes.length}`}
                </p>
                <button
                    onClick={endTask}
                    disabled={!selectedProcess}
                    className="btn-retro disabled:pointer-events-none disabled:opacity-50"
                >
                    End Task
                </button>
            </div>
        </div>
    );
};
