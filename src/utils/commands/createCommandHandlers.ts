import { useFileSystemStore } from "../../atoms/fileSystem";
import { useTerminalStore, useWindowStore } from "../../atoms";
import { BufferSpec, MiniVim } from "../../apps/Console/MiniVim";

type FileSystemNode = {
    type: "file" | "directory";
    content?: string;
    src?: string;
    mime?: string;
    children?: Record<string, FileSystemNode>;
    hidden?: boolean;
};

export type CommandOutput =
    | string
    | "__CLEAR__"
    | {
          type: "confirm";
          message: string;
          perform: () => string | Promise<string>;
      };

export const confirm = (
    message: string,
    perform: () => string | Promise<string>
): CommandOutput => ({ type: "confirm", message, perform });

function getCurrentPath(): string[] {
    return [...useFileSystemStore.getState().currentPath];
}

function resolvePath(abs: string[]): FileSystemNode | null {
    return useFileSystemStore.getState().resolvePath(abs);
}

export function toAbsolutePath(raw: string): string[] {
    if (!raw || raw === ".") return [...getCurrentPath()];
    if (raw.startsWith("~/")) return ["~", ...raw.slice(2).split("/").filter(Boolean)];
    if (raw === "~") return ["~"];
    if (raw.startsWith("~")) return raw.split("/").filter(Boolean);

    const parts = raw.split("/").filter(Boolean);
    const next = [...getCurrentPath()];
    for (const p of parts) {
        if (p === "..") {
            if (next.length > 1) next.pop();
        } else if (p !== ".") next.push(p);
    }
    return next;
}

function currentDirNode(): FileSystemNode {
    return resolvePath(getCurrentPath()) as FileSystemNode;
}

function pathString(): string {
    return getCurrentPath().join("/");
}

function guessMime(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "pdf":
            return "application/pdf";
        case "txt":
        case "md":
        case "log":
        case "conf":
        case "json":
        case "yaml":
        case "yml":
            return "text/plain";
        default:
            return "application/octet-stream";
    }
}

function writeTree(mutator: (tree: Record<string, FileSystemNode>) => void) {
    useFileSystemStore.setState((s: any) => {
        const nextTree = { ...(s.tree as Record<string, FileSystemNode>) };
        mutator(nextTree);
        return { ...s, tree: nextTree };
    });
}

export function createCommandHandlers({
    duckCount,
    setDuckCount,
    duckMode,
    setDuckMode,
    duckModeActivatedAt,
    setDuckModeActivatedAt,
}: {
    duckCount: number;
    setDuckCount: (count: number) => void;
    duckMode: boolean;
    setDuckMode: (mode: boolean) => void;
    duckModeActivatedAt: number | null;
    setDuckModeActivatedAt: (time: number | null) => void;
}) {
    const bootTime = Date.now();

    return {
        help: () => {
            if (duckMode) {
                return `
DuckdiOS Command Menu (QUACK MODE):
- quack           Talk to the OS duck
- bread           Offer bread to the OS duck/
- pond            Visit the virtual pond
- duckmode        Check if you're in Duck Mode
- duckstats       See how long Duck Mode has been active
- unduck          Return to boring human mode
- waddle          Just... waddles
- honk?           no.
    `.trim();
            }

            return `
Available commands:
# Basics
- help               Show this help menu
- clear              Clear the terminal screen
- echo [text]        Print text back

# File system
- ls [dir]           List items (defaults to current directory)
- cd [dir]           Change directory
- pwd                Print current directory
- mkdir [dir]        Create a new directory
- touch [file]       Create a new file
- cat [file]         Display file contents
- rm [name]          Delete a file or folder (dangerous!)
- xdg-open [FILE|URL] Open a file or URL (PDF/text opens viewer)

# Editor
- vim [files...]     Open a minimal editor for one or more files

# Apps & windows
- open [app]         Open an app (e.g. open about)
- close [app]        Close an app
- minimize [app]     Minimize an app
- maximize [app]     Toggle fullscreen for an app

# System info & fun
- whoami             Show user identity
- date               Show current date/time
- uptime             Time since terminal was opened
- sudo               Attempt superuser privileges (good luck)
- hack               Try (and fail) to breach the mainframe
- fortune            Print a short fortune
  `.trim();
        },

        clear: () => "__CLEAR__",

        ls: (args: string[] = []) => {
            if (!args[0]) {
                const node = resolvePath(getCurrentPath());
                if (!node || node.type !== "directory") return "Not a directory";
                return Object.keys(node.children ?? {}).join("  ");
            }
            const abs = toAbsolutePath(args[0]);
            const node = resolvePath(abs);
            if (!node) return `ls: cannot access '${args[0]}': No such file or directory`;
            if (node.type !== "directory") return args[0];
            return Object.keys(node.children ?? {}).join("  ");
        },

        cd: (args: string[]) => {
            if (duckMode) return "cd: ducks don't do directories.";
            const raw = args[0];
            if (!raw) return "Usage: cd [directory]";
            if (raw === ".") return `Moved to ${getCurrentPath().join("/")}`;
            if (raw === "..") {
                const cur = getCurrentPath();
                if (cur.length > 1) useFileSystemStore.setState({ currentPath: cur.slice(0, -1) });
                return `Moved to ${getCurrentPath().join("/")}`;
            }
            const abs = toAbsolutePath(raw);
            const node = resolvePath(abs);
            if (!node || node.type !== "directory") return `cd: no such directory: ${raw}`;
            useFileSystemStore.setState({ currentPath: abs });
            return `Moved to ${abs.join("/")}`;
        },

        pwd: () => (duckMode ? "/pond/nest/bread" : pathString()),

        mkdir: (args: string[]) => {
            if (duckMode) return "mkdir: ducks don't need folders, we have nests.";
            const name = args[0];
            if (!name) return "Usage: mkdir [name]";
            const here = currentDirNode();
            if (here.children?.[name]) return "Directory already exists.";
            writeTree((tree) => {
                let node: FileSystemNode = tree["~"];
                for (const part of getCurrentPath().slice(1)) node = (node.children as any)[part];
                (node.children ||= {})[name] = { type: "directory", children: {} };
            });
            return `Directory "${name}" created.`;
        },

        touch: (args: string[]) => {
            if (duckMode) return "touch: touching files is weird. Try bread instead.";
            const name = args[0];
            if (!name) return "Usage: touch [filename]";
            writeTree((tree) => {
                let node: FileSystemNode = tree["~"];
                for (const part of getCurrentPath().slice(1)) node = (node.children as any)[part];
                (node.children ||= {})[name] = { type: "file", content: "" };
            });
            return `File "${name}" created.`;
        },

        cat: (args: string[]) => {
            if (duckMode) return "cat: QuackdiOS prefers ducks, not cats.";
            const name = args[0];
            const node = currentDirNode();
            const file = node.children?.[name];
            if (!file || file.type !== "file") return `cat: ${name}: No such file`;
            return file.content ?? "";
        },

        rm: (args: string[]): CommandOutput => {
            if (duckMode) return "rm: Ducks never forget. But they also don't delete.";
            const name = args[0];
            if (!name) return "Usage: rm [name]";

            const here = currentDirNode();
            if (!here.children?.[name]) {
                return `rm: cannot remove '${name}': No such file or directory`;
            }

            const dangerous = new Set(["kernel", "system32"]);
            if (dangerous.has(name)) {
                return confirm(`rm:"${name}". Are you sure? (Y/N)`, () => {
                    writeTree((tree) => {
                        let node: FileSystemNode = tree["~"];
                        for (const p of getCurrentPath().slice(1)) node = (node.children as any)[p];
                        if (node.children) delete node.children[name];
                    });
                    return `'${name}' removed. May the ducks be with you.`;
                });
            }

            writeTree((tree) => {
                let node: FileSystemNode = tree["~"];
                for (const p of getCurrentPath().slice(1)) node = (node.children as any)[p];
                if (node.children) delete node.children[name];
            });
            return `'${name}' removed.`;
        },

        sudo: () =>
            duckMode ? "🦆 You already have full duck privileges." : "You have no power here.",

        hack: () =>
            duckMode
                ? "Hacking the pond security perimeter...\n🦆 Too powerful. Abort."
                : "Attempting to breach the mainframe...\nACCESS DENIED\nYour IP has been logged 😈",

        fortune: () =>
            duckMode
                ? "One day, all computers will be made of breadcrumbs."
                : "You will debug something for 6 hours just to realize it's a typo.",

        whoami: () => (duckMode ? "duck@pond:~$" : "lucas@lucasos:~$"),

        date: () => (duckMode ? "🦆 It's always time for a swim." : new Date().toString()),

        uptime: () => {
            if (duckMode) return "🦆 You've been quacking for far too long.";
            const seconds = Math.floor((Date.now() - bootTime) / 1000);
            return `Uptime: ${seconds} seconds`;
        },

        echo: (args: string[]) =>
            duckMode ? "quack quack quack " + "🦆".repeat(args.length) : args.join(" "),

        open: (args: string[]) => {
            if (duckMode) return `You try to open "${args[0]}", but it's just... feathers.`;
            const appId = args[0];
            if (!appId) return "Specify an app to open.";
            useWindowStore.getState().openApp(appId);
            return `Opening "${appId}" app...`;
        },

        close: (args: string[]) => {
            if (duckMode) return `You try to close "${args[0]}", but ducks don't close things.`;
            const appId = args[0];
            if (!appId) return "Specify an app to close.";
            useWindowStore.getState().closeApp(appId);
            return `Closing "${appId}" app...`;
        },

        minimize: (args: string[]) => {
            if (duckMode) return `Minimizing? More like diving underwater.`;
            const appId = args[0];
            if (!appId) return "Specify an app to minimize.";
            useWindowStore.getState().minimizeApp(appId);
            return `Minimizing "${appId}"...`;
        },

        maximize: (args: string[]) => {
            if (duckMode) return `Maximizing? My feathers are already puffed.`;
            const appId = args[0];
            if (!appId) return "Specify an app to maximize.";
            useWindowStore.getState().toggleFullscreenApp(appId);
            return `Toggling fullscreen on "${appId}"...`;
        },

        "xdg-open": (args: string[]) => {
            if (duckMode) return `You try to xdg-open "${args[0]}", but it's just.... feathers?`;

            const raw = args[0];
            if (!raw) return "Usage: xdg-open [FILE|URL]";

            // TODO: Implement navigate to correct URL inside the browser app
            if (/ĥttps?:\/\//i.test(raw)) {
                useWindowStore.getState().openApp?.("browser");
                return `Opening URL: ${raw}...`;
            }

            const abs = toAbsolutePath(raw);
            const node = resolvePath(abs);
            if (!node || node.type !== "file") return `xdg-open: "${raw}": No such file`;

            const mime = node.mime || guessMime(raw);
            const isPdf = mime === "application/pdf" || raw.toLowerCase().endsWith(".pdf");
            const isText = mime.startsWith("text/");

            if ((isPdf && (node.src || node.content)) || isText) {
                useWindowStore.getState().openApp("pdfviewer", {
                    props: {
                        fileName: { node },
                    },
                });
            }
        },

        vim: (args: string[]) => {
            if (duckMode) return "vim: Ducks prefer `quack` over `:wq`.";

            const term = useTerminalStore.getState().term;
            if (!term) return "vim: terminal not ready.";

            const files = args.length ? args : ["[No Name]"];

            const specs: BufferSpec[] = files.map((raw) => {
                let pathArr = raw.startsWith("~") ? ["~"] : [...getCurrentPath()];
                const segs = (raw.startsWith("~") ? raw.replace(/^~\/?/, "") : raw)
                    .split("/")
                    .filter(Boolean);
                for (const s of segs) {
                    if (s === ".") continue;
                    if (s === "..") {
                        if (pathArr.length > 1) pathArr.pop();
                    } else pathArr.push(s);
                }

                const parentPath = pathArr.slice(0, -1);
                const fname = pathArr[pathArr.length - 1] || "[No Name]";
                const parent = resolvePath(parentPath);
                if (!parent || parent.type !== "directory") return { filename: raw, text: "" };

                if (!parent.children![fname])
                    parent.children![fname] = { type: "file", content: "" };
                const node = parent.children![fname];

                const get = () => (node.type === "file" ? (node.content ?? "") : "");
                const set = (t: string) => {
                    if (node.type === "file") node.content = t;
                };

                return { filename: raw, text: get(), onSave: set };
            });

            useTerminalStore.getState().setHijacked(true);

            const editor = new MiniVim(term, specs, () => {
                useTerminalStore.getState().setHijacked(false);
                term.write("Exited editor\r\n");
                term.write("> ");
            });

            editor.onUi = (ui) => {
                // Todo: add Some logic for eample to change title bar or something
            };

            return "";
        },

        // Duck stuff
        bread: () => {
            if (!duckMode) return "bread: command not found. Try quack-ing first.";
            return "🍞 You toss a piece of bread. Somewhere, a duck smiles.";
        },

        pond: () => {
            if (!duckMode) return "You approach the pond. Nothing happens.";
            return `
      ~  ~   🦆    ~     ~
  ~     ~       ~    ~
       ~     🐟     ~    🪷
  You feel calm. The pond accepts you.
      `.trim();
        },

        duckstats: () => {
            if (!duckMode || !duckModeActivatedAt) return "Duck Mode is OFF.";
            const seconds = Math.floor((Date.now() - duckModeActivatedAt) / 1000);
            return `🦆 Duck Mode has been active for ${seconds} seconds.`;
        },

        quack: () => {
            const newCount = duckCount + 1;
            setDuckCount(newCount);

            if (newCount >= 10 && !duckMode) {
                setDuckMode(true);
                setDuckModeActivatedAt(Date.now());
                return "🦆 Duck Mode activated. All commands must now be spoken in Quack.";
            }

            const responses = [
                "quack.",
                "QUACK!",
                "quack quack quack...",
                "bread?",
                "Where's the pond?",
                "*waddles aggressively*",
                "You dare speak to me, featherless biped?",
                "QuackdiOS is listening.",
                "System overheating: too much bread.",
                "What’s it like... to not be a duck?",
                "*stares at you with beady eyes*",
                "Why is this human talking to me?",
                "Did you just try to talk duck to me?",
                "Your IP has been logged... quack.",
                "404: Pond not found.",
                "Executing `quack --force`... complete.",
                "🦆🦆🦆🦆🦆",
            ];

            const randomIndex = Math.floor(Math.random() * responses.length);
            return responses[randomIndex];
        },

        duck: (args: string[]) => {
            if (!duckMode) return "duck: command only available in Duck Mode.";
            const name = args[0];
            const node = currentDirNode();
            const file = node.children?.[name];
            if (!file || file.type !== "file") return `duck: ${name}: No such file`;
            return file.content ?? "";
        },

        duckmode: () => (duckMode ? "🦆 Duck Mode is currently ACTIVE." : "Duck Mode is OFF."),

        unduck: () => {
            setDuckMode(false);
            setDuckCount(0);
            setDuckModeActivatedAt(null);
            return "Duck Mode deactivated. You're no longer speaking quack.";
        },

        waddle: () => "Waddle waddle",
    };
}
