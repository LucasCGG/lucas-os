import { useWindowStore } from "../../store";

type FileSystemNode = {
    type: "file" | "directory";

    content?: string;
    src?: string;
    mime?: string;

    children?: Record<string, FileSystemNode>;

    hidden?: boolean;
};

function toAbsolutePath(raw: string): string[] {
    if (!raw || raw === ".") return [...currentPath];
    if (raw.startsWith("~/")) return ["~", ...raw.slice(2).split("/").filter(Boolean)];
    if (raw === "~") return ["~"];
    if (raw.startsWith("~")) return raw.split("/").filter(Boolean);

    const parts = raw.split("/").filter(Boolean);
    const next = [...currentPath];
    for (const p of parts) {
        if (p === "..") {
            if (next.length > 1) next.pop();
        } else if (p !== ".") next.push(p);
    }
    return next;
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

let currentPath = ["~"];

let fileSystem: Record<string, FileSystemNode> = {
    "~": {
        type: "directory",
        children: {
            // Apps you already have
            apps: {
                type: "directory",
                children: {
                    about: { type: "file", content: "About App" },
                    projects: { type: "file", content: "Projects App" },
                    terminal: { type: "file", content: "Terminal App" },
                    PdfViewer: { type: "file", content: "Pdf Viewer App" }, // logical app id
                },
            },

            // Desktop (with a cheeky shortcut)
            Desktop: {
                type: "directory",
                children: {
                    "Open My CV.desktop": {
                        type: "file",
                        mime: "application/x-desktop",
                        content: `[Desktop Entry]
Type=Application
Name=Open My CV
Exec=openfile ~/Documents/CV/CV_Lucas_Colaco.pdf
Comment=Shortcut to Lucas' CV
`,
                    },
                    "README.txt": {
                        type: "file",
                        mime: "text/plain",
                        content:
                            "Drag files here? Not supported (yet). Try `ls`, `cd Desktop`, then `cat README.txt` 😉",
                    },
                },
            },

            // Documents with real “portfolio” content
            Documents: {
                type: "directory",
                children: {
                    "readme.txt": {
                        type: "file",
                        mime: "text/plain",
                        content: "This is a fake terminal.\nFeel free to explore.",
                    },
                    "about_me.txt": {
                        type: "file",
                        mime: "text/plain",
                        content: `...your same about text...`,
                    },
                    "skills.txt": {
                        type: "file",
                        mime: "text/plain",
                        content: `...your same skills text...`,
                    },
                    "timeline.txt": {
                        type: "file",
                        mime: "text/plain",
                        content: `...your same timeline text...`,
                    },
                    "contacts.txt": {
                        type: "file",
                        mime: "text/plain",
                        content: `...your same contacts text...`,
                    },
                    "CV_Lucas_Colaco.pdf": {
                        type: "file",
                        mime: "application/pdf",
                        src: "/files/CV_Lucas_Colaco.pdf",
                    },
                    "dont_open.pdf": {
                        type: "file",
                        mime: "application/pdf",
                        src: "/files/easter-eggs/duck_manifesto.pdf",
                    },

                    Notes: {
                        type: "directory",
                        children: {
                            "ideas.txt": {
                                type: "file",
                                mime: "text/plain",
                                content:
                                    "- Rive hero animation with cursor parallax\n- Hyprland tiling animation when opening apps\n- Fake package manager `pacduck`",
                            },
                            "todo.txt": {
                                type: "file",
                                mime: "text/plain",
                                content:
                                    "[ ] polish window snap\n[ ] add `tree` command\n[ ] power menu animation\n[ ] add fetch banner",
                            },
                        },
                    },
                },
            },

            Downloads: { type: "directory", children: {} },

            Pictures: {
                type: "directory",
                children: {
                    "hypr_screenshot.png": {
                        type: "file",
                        mime: "image/png",
                        src: "/files/images/hypr_screenshot.png",
                    },
                    "duck.png": { type: "file", mime: "image/png", src: "/files/images/duck.png" },
                },
            },

            // Realistic dotfiles & configs (hidden)
            ".config": {
                type: "directory",
                hidden: true,
                children: {
                    hypr: {
                        type: "directory",
                        children: {
                            "hyprland.conf": {
                                type: "file",
                                mime: "text/plain",
                                content: `# Hyprland (fake)
monitor=,preferred,auto,1
input {
  kb_layout=ch
}
exec-once = waybar & mako`,
                            },
                            "keybinds.conf": {
                                type: "file",
                                mime: "text/plain",
                                content: `# Binds (fake)
bind = SUPER, RETURN, exec, kitty
bind = SUPER, Q, killactive`,
                            },
                        },
                    },
                    waybar: {
                        type: "directory",
                        children: {
                            "config.jsonc": {
                                type: "file",
                                mime: "text/plain",
                                content: "{ /* pretend waybar config */ }",
                            },
                            "style.css": {
                                type: "file",
                                mime: "text/plain",
                                content: "/* pretend CSS */",
                            },
                        },
                    },
                    kitty: {
                        type: "directory",
                        children: {
                            "kitty.conf": {
                                type: "file",
                                mime: "text/plain",
                                content: "font_size 12.0\nbackground_opacity 0.9",
                            },
                        },
                    },
                    neofetch: {
                        type: "directory",
                        children: {
                            "config.conf": {
                                type: "file",
                                mime: "text/plain",
                                content: "# pretend neofetch config",
                            },
                        },
                    },
                    "starship.toml": {
                        type: "file",
                        mime: "text/plain",
                        content: '[character]\nsuccess_symbol = "🦆 "\nerror_symbol = "💥 "',
                    },
                },
            },

            ".ssh": {
                type: "directory",
                hidden: true,
                children: {
                    config: {
                        type: "file",
                        mime: "text/plain",
                        content: `Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519`,
                    },
                    "id_ed25519.pub": {
                        type: "file",
                        mime: "text/plain",
                        content: "ssh-ed25519 AAAA... lucas@hypr",
                    },
                },
            },

            ".local": {
                type: "directory",
                hidden: true,
                children: {
                    share: {
                        type: "directory",
                        children: {
                            applications: {
                                type: "directory",
                                children: {
                                    "portfolio.desktop": {
                                        type: "file",
                                        mime: "application/x-desktop",
                                        content: `[Desktop Entry]
Type=Application
Name=Portfolio
Exec=open projects
Comment=Launches projects app`,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // Fun “system-like” areas (not actually system-critical)
            etc: {
                type: "directory",
                children: {
                    "os-release": {
                        type: "file",
                        mime: "text/plain",
                        content: `NAME="Arch (Replica)"
PRETTY_NAME="Arch Replica (Hyprland)"`,
                    },
                    motd: {
                        type: "file",
                        mime: "text/plain",
                        content: "Welcome to QuackdiOS 🦆  — type `fortune`",
                    },
                },
            },

            usr: {
                type: "directory",
                children: {
                    bin: {
                        type: "directory",
                        children: {
                            pacduck: {
                                type: "file",
                                mime: "text/plain",
                                content: "#!/bin/duck\n# fake package manager",
                            },
                        },
                    },
                    share: { type: "directory", children: {} },
                },
            },

            var: {
                type: "directory",
                children: {
                    log: {
                        type: "directory",
                        children: {
                            "system.log": {
                                type: "file",
                                mime: "text/plain",
                                content: "Aug 29 23:59:59 kernel: duck module loaded",
                            },
                            "hypr.log": {
                                type: "file",
                                mime: "text/plain",
                                content: "[INFO] fake compositor started",
                            },
                        },
                    },
                },
            },

            // Your existing secrets + silly “critical” file
            ".secrets": {
                type: "directory",
                hidden: true,
                children: {
                    "passwords.txt": {
                        type: "file",
                        mime: "text/plain",
                        content: `root: hunter2\nadmin: bread123\nlucas: ducklover`,
                    },
                },
            },

            // Keep the joke, but make it Linuxy
            "vmlinuz-duck": {
                type: "file",
                mime: "application/octet-stream",
                content: "Binary gibberish\nDo not delete this file. Seriously.",
            },
        },
    },
};

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

    function resolvePath(pathArray: string[]): FileSystemNode | null {
        let node: FileSystemNode = fileSystem["~"];
        for (const part of pathArray.slice(1)) {
            if (node.type === "directory" && node.children?.[part]) {
                node = node.children[part];
            } else {
                return null;
            }
        }
        return node;
    }

    function currentDirNode(): FileSystemNode {
        return resolvePath(currentPath) as FileSystemNode;
    }

    function pathString(): string {
        return currentPath.join("/");
    }

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
- help            Show this help menu
- clear           Clear the terminal screen
- ls              List items in current directory
- cd [dir]        Change fake directory
- pwd             Print current directory
- whoami          Show user identity
- date            Show current date/time
- uptime          Time since terminal was opened
- echo [text]     Print text back
- open [app]      Open an app (e.g. open about)
- close [app]     Close an app
- minimize [app]  Minimize an app
- maximize [app]  Maximize an app
- mkdir [dir]     Create a new fake directory
- touch [file]    Create a new fake file
- cat [file]      Display contents of a fake file
- rm [name]       Delete a fake file or folder (dangerous!)
- quack           Talk to the OS duck
- duckmode        Check Duck Mode status
- duckstats       See Duck Mode uptime
- unduck          Disable Duck Mode (why would you tho?)
- waddle          Just... waddles
      `.trim();
        },

        clear: () => "__CLEAR__",

        ls: () => {
            const node = currentDirNode();
            if (node.type !== "directory") return "Not a directory";
            return Object.keys(node.children ?? {}).join("  ");
        },

        cd: (args: string[]) => {
            if (duckMode) return "cd: ducks don't do directories.";
            const dir = args[0];
            if (!dir) return "Usage: cd [directory]";
            if (dir === "..") {
                if (currentPath.length > 1) currentPath.pop();
                return `Moved to ${pathString()}`;
            }
            const next = resolvePath([...currentPath, dir]);
            if (!next || next.type !== "directory") return `cd: no such directory: ${dir}`;
            currentPath.push(dir);
            return `Moved to ${pathString()}`;
        },

        pwd: () => (duckMode ? "/pond/nest/bread" : pathString()),

        mkdir: (args: string[]) => {
            if (duckMode) return "mkdir: ducks don't need folders, we have nests.";
            const name = args[0];
            if (!name) return "Usage: mkdir [name]";
            const node = currentDirNode();
            if (node.children?.[name]) return "Directory already exists.";
            node.children![name] = { type: "directory", children: {} };
            return `Directory "${name}" created.`;
        },

        touch: (args: string[]) => {
            if (duckMode) return "touch: touching files is weird. Try bread instead.";
            const name = args[0];
            if (!name) return "Usage: touch [filename]";
            const node = currentDirNode();
            node.children![name] = { type: "file", content: "" };
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
            const node = currentDirNode();
            if (!name) return "Usage: rm [name]";
            if (!node.children?.[name]) {
                return `rm: cannot remove '${name}': No such file or directory`;
            }

            // choose which names are “dangerous”
            const dangerous = new Set(["kernel", "system32"]);
            if (dangerous.has(name)) {
                return confirm(`rm:"${name}". Are you sure? (Y/N)`, () => {
                    delete node.children![name];
                    return `'${name}' removed. May the ducks be with you.`;
                });
            }

            delete node.children[name];
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

        // Duck-specific commands
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
