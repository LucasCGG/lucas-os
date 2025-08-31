import { create } from "zustand";

export type FileSystemNode = {
    type: "file" | "directory";
    content?: string;
    children?: Record<string, FileSystemNode>;

    mime?: string;
    src?: string;
    hidden?: boolean;
};

type FileSystemState = {
    tree: Record<string, FileSystemNode>;
    currentPath: string[]; 

    pathString: () => string;
    resolvePath: (pathArr: string[]) => FileSystemNode | null;

    cdAbs: (absPath: string[]) => boolean;
    lsHere: () => string[];
    mkdirHere: (name: string) => boolean;
    touchHere: (name: string) => boolean;
    readFileHere: (name: string) => string | null;
    writeFileAbs: (absPath: string[], content: string) => boolean;
    rmHere: (name: string) => boolean;

    ensureDirAbs: (absPath: string[]) => FileSystemNode | null;
};

function initialTree(): Record<string, FileSystemNode> {
    return {
        "~": {
            type: "directory",
            children: {
                
                apps: {
                    type: "directory",
                    children: {
                        about: { type: "file", content: "About App" },
                        projects: { type: "file", content: "Projects App" },
                        terminal: { type: "file", content: "Terminal App" },
                        PdfViewer: { type: "file", content: "Pdf Viewer App" }, 
                    },
                },
               
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
                        "duck.png": {
                            type: "file",
                            mime: "image/png",
                            src: "/files/images/duck.png",
                        },
                    },
                },

                
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
                            content: "Welcome to LucasOS",
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

                "vmlinuz-lucasos": {
                    type: "file",
                    mime: "application/octet-stream",
                    content: "Binary gibberish\nDo not delete this file. Seriously.",
                },
            },
        },
    };
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
    tree: initialTree(),
    currentPath: ["~"],

    pathString: () => get().currentPath.join("/"),

    resolvePath: (pathArr) => {
        const t = get().tree;
        let node = t["~"];
        for (const part of pathArr.slice(1)) {
            if (!node || node.type !== "directory" || !node.children) return null;
            const next = node.children[part];
            if (!next) return null;
            node = next;
        }
        return node || null;
    },

    cdAbs: (absPath) => {
        const node = get().resolvePath(absPath);
        if (!node || node.type !== "directory") return false;
        set({ currentPath: absPath });
        return true;
    },

    lsHere: () => {
        const node = get().resolvePath(get().currentPath);
        if (!node || node.type !== "directory") return [];
        return Object.keys(node.children ?? {});
    },

    mkdirHere: (name) => {
        const here = get().resolvePath(get().currentPath);
        if (!here || here.type !== "directory") return false;
        if (!here.children) here.children = {};
        if (here.children[name]) return false;
        here.children[name] = { type: "directory", children: {} };
        // trigger update by shallow clone from root (keeps references simple)
        set({ tree: { ...get().tree } });
        return true;
    },

    touchHere: (name) => {
        const here = get().resolvePath(get().currentPath);
        if (!here || here.type !== "directory") return false;
        if (!here.children) here.children = {};
        here.children[name] = { type: "file", content: "" };
        set({ tree: { ...get().tree } });
        return true;
    },

    readFileHere: (name) => {
        const here = get().resolvePath(get().currentPath);
        const node = here && here.type === "directory" ? here.children?.[name] : null;
        if (!node || node.type !== "file") return null;
        return node.content ?? "";
    },

    writeFileAbs: (absPath, content) => {
        if (absPath.length < 2) return false;
        const parentPath = absPath.slice(0, -1);
        const fname = absPath[absPath.length - 1];
        const parent = get().resolvePath(parentPath);
        if (!parent || parent.type !== "directory") return false;
        if (!parent.children) parent.children = {};
        const file = (parent.children[fname] ||= { type: "file", content: "" });
        if (file.type !== "file") return false;
        file.content = content;
        set({ tree: { ...get().tree } });
        return true;
    },

    rmHere: (name) => {
        const here = get().resolvePath(get().currentPath);
        if (!here || here.type !== "directory" || !here.children?.[name]) return false;
        delete here.children[name];
        set({ tree: { ...get().tree } });
        return true;
    },

    ensureDirAbs: (absPath) => {
        if (absPath.length === 0) return null;
        const t = get().tree;
        if (absPath[0] !== "~") return null;
        let node = t["~"];
        for (const part of absPath.slice(1)) {
            if (node.type !== "directory") return null;
            if (!node.children) node.children = {};
            if (!node.children[part]) node.children[part] = { type: "directory", children: {} };
            node = node.children[part];
        }
        set({ tree: { ...t } });
        return node;
    },
}));
