import { FC, useEffect, useRef, useState } from "react";
import { useFileSystemStore, useWindowStore } from "../../atoms";
import type { FileSystemNode } from "../../atoms/fileSystem";
import { AppIcon } from "../../components";
import { useIsMobile } from "../../hooks";
import { useTrans } from "../../hooks/useTrans";
import { ImagePreview, PreviewImage } from "./ImagePreview";
import { ProjectDetail } from "./ProjectDetail";
import { Project, projects } from "./projects";

// The explorer browses the same virtual file system as the Console; paths look like ["~", "Projects"].
type Path = string[];
type Entry = { name: string; path: Path; node: FileSystemNode };
type FileKind = "app" | "image" | "pdf" | "text";

const HOME: Path = ["~"];
const START_PATH: Path = ["~", "Projects"];

// On desktop the window's content area is full-height underneath the 40px titlebar.
const DESKTOP_TITLEBAR_HEIGHT = 40;

const pathKey = (path: Path) => path.join("/");
const samePath = (a: Path, b: Path) => pathKey(a) === pathKey(b);

const resolve = (tree: Record<string, FileSystemNode>, path: Path): FileSystemNode | null => {
    let node: FileSystemNode | undefined = tree[path[0]];
    for (const part of path.slice(1)) {
        if (node?.type !== "directory") return null;
        node = node.children?.[part];
    }
    return node ?? null;
};

const childrenOf = (node: FileSystemNode, path: Path): Entry[] =>
    Object.entries(node.children ?? {}).map(([name, child]) => ({
        name,
        path: [...path, name],
        node: child,
    }));

const projectAt = (path: Path): Project | undefined =>
    path.length === 3 && path[1] === START_PATH[1]
        ? projects.find((project) => project.id === path[2])
        : undefined;

const isHidden = (entry: Entry) => entry.node.hidden || entry.name.startsWith(".");

const fileKind = ({ name, node }: Entry): FileKind => {
    if (node.appId) return "app";
    const mime = node.mime ?? "";
    if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return "image";
    if (mime === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
    return "text";
};

const fileIcons: Record<FileKind, string> = {
    app: "icn-logo-simple",
    image: "icn-image-file",
    pdf: "icn-pdf-file",
    text: "icn-text-file",
};

const entryIcon = (entry: Entry) =>
    entry.node.type === "directory" ? "icn-folder" : (entry.node.icon ?? fileIcons[fileKind(entry)]);

/** Folders first, then files, alphabetically. ~/Projects keeps the curated project order instead. */
const sortEntries = (entries: Entry[], inProjects: boolean) =>
    [...entries].sort((a, b) => {
        if (a.node.type !== b.node.type) return a.node.type === "directory" ? -1 : 1;
        if (inProjects) {
            const rank = (entry: Entry) => {
                const index = projects.findIndex((project) => project.id === entry.name);
                return index === -1 ? projects.length : index;
            };
            if (rank(a) !== rank(b)) return rank(a) - rank(b);
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });

const matchesQuery = (entry: Entry, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const project = projectAt(entry.path);
    const fields = project
        ? [entry.name, project.name, project.summary, project.category, ...project.stack]
        : [entry.name, entry.node.title ?? ""];
    return fields.some((field) => field.toLowerCase().includes(q));
};

const ToolbarButton = ({
    icon,
    label,
    onClick,
    disabled,
}: {
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className="btn-retro-icon rounded text-sidebar disabled:pointer-events-none disabled:opacity-35"
    >
        <AppIcon icon={icon} size="sm" />
    </button>
);

/** Image thumbnail that falls back to the file icon when the image can't be loaded. */
const Thumbnail = ({ src, className }: { src: string; className: string }) => {
    const [failed, setFailed] = useState(false);

    if (failed) return <AppIcon icon="icn-image-file" size="auto" />;

    return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={className} />;
};

const EntryTile = ({ entry, label, onOpen }: { entry: Entry; label: string; onOpen: () => void }) => {
    const project = projectAt(entry.path);
    const preview = project?.screenshots[0];
    const kind = entry.node.type === "file" ? fileKind(entry) : null;

    return (
        <button
            onClick={onOpen}
            title={project?.summary ?? entry.node.title ?? entry.name}
            className={`group flex flex-col items-center gap-1 rounded-md p-2 text-center transition-colors hover:bg-[#EAD3A2] focus-visible:bg-[#EAD3A2] focus-visible:outline-none ${
                isHidden(entry) ? "opacity-60" : ""
            }`}
        >
            <div className="relative flex aspect-square w-16 items-center justify-center">
                {kind === "image" && entry.node.src ? (
                    <Thumbnail
                        src={entry.node.src}
                        className="max-h-full max-w-full border-2 border-[#392107] object-cover"
                    />
                ) : (
                    <AppIcon icon={entryIcon(entry)} size="auto" className="drop-shadow-sm" />
                )}
                {preview && (
                    // A peek at the first screenshot sticking out of the folder, like Explorer's folder previews.
                    <img
                        src={preview.src}
                        alt=""
                        loading="lazy"
                        className="absolute left-[18%] top-[38%] h-[26%] w-[64%] -rotate-3 border border-[#392107] object-cover object-top transition-transform group-hover:-translate-y-1"
                    />
                )}
            </div>
            <span className="line-clamp-2 w-full text-xs font-semibold leading-tight [overflow-wrap:anywhere]">
                {label}
            </span>
            {project && <span className="text-[10px] opacity-60">{project.year}</span>}
        </button>
    );
};

/** Shows a text file's inline content, or fetches it when the node points at a static file. */
const TextFileView = ({ node, onLineCount }: { node: FileSystemNode; onLineCount: (count: number) => void }) => {
    const { t } = useTrans();
    // text is null when the file couldn't be fetched.
    const [fetched, setFetched] = useState<{ src: string; text: string | null } | null>(null);
    const loaded = node.content !== undefined || !node.src || fetched?.src === node.src;
    const text = node.content ?? (fetched && fetched.src === node.src ? fetched.text : "");

    useEffect(() => {
        if (node.content !== undefined || !node.src) return;

        const src = node.src;
        let cancelled = false;
        fetch(src)
            .then((response) => (response.ok ? response.text() : null))
            .catch(() => null)
            .then((body) => {
                if (!cancelled) setFetched({ src, text: body });
            });

        return () => {
            cancelled = true;
        };
    }, [node]);

    useEffect(() => {
        if (loaded) onLineCount(text === null ? 0 : text.split("\n").length);
    }, [loaded, text, onLineCount]);

    if (!loaded) return <p className="p-4 text-sm opacity-60">{t("app.projects.loading")}</p>;
    if (text === null) return <p className="p-4 text-sm opacity-60">{t("app.projects.fileUnavailable")}</p>;

    return (
        <pre className="min-h-full whitespace-pre-wrap break-words rounded border-2 border-sidebar/40 bg-[#FFF8EA] p-4 font-mono text-xs leading-5">
            {text || " "}
        </pre>
    );
};

const TreeItem = ({
    entry,
    depth,
    label,
    current,
    expanded,
    onToggle,
    onOpen,
}: {
    entry: Entry;
    depth: number;
    label: (path: Path) => string;
    current: Path;
    expanded: Set<string>;
    onToggle: (path: Path) => void;
    onOpen: (path: Path) => void;
}) => {
    const key = pathKey(entry.path);
    const isOpen = expanded.has(key);
    const folders = sortEntries(
        childrenOf(entry.node, entry.path).filter((child) => child.node.type === "directory"),
        samePath(entry.path, START_PATH)
    );
    const active = samePath(entry.path, current);

    return (
        <li>
            <div
                className={`flex items-center ${active ? "bg-[#EAD3A2] font-semibold" : "hover:bg-[#EFDCB4]"} ${
                    isHidden(entry) ? "opacity-60" : ""
                }`}
                style={{ paddingLeft: depth * 12 }}
            >
                <button
                    onClick={() => onToggle(entry.path)}
                    aria-label={label(entry.path)}
                    className={`flex h-6 w-5 shrink-0 items-center justify-center text-sidebar ${
                        folders.length === 0 ? "invisible" : ""
                    }`}
                >
                    <AppIcon icon="icn-arrow-right" size="2xs" className={isOpen ? "rotate-90" : ""} />
                </button>
                <button
                    onClick={() => onOpen(entry.path)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 py-1 pr-2 text-left"
                >
                    <AppIcon icon="icn-folder" size="sm" className="shrink-0" />
                    <span className="truncate">{label(entry.path)}</span>
                </button>
            </div>
            {isOpen && folders.length > 0 && (
                <ul>
                    {folders.map((folder) => (
                        <TreeItem
                            key={folder.name}
                            entry={folder}
                            depth={depth + 1}
                            label={label}
                            current={current}
                            expanded={expanded}
                            onToggle={onToggle}
                            onOpen={onOpen}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export const ProjectsApp: FC = () => {
    const { t } = useTrans();
    const isMobile = useIsMobile();
    const bottomInset = isMobile ? 0 : DESKTOP_TITLEBAR_HEIGHT;

    // Subscribing to the tree keeps the explorer in sync with mkdir/touch/rm/vim in the Console.
    const tree = useFileSystemStore((state) => state.tree);
    const openApp = useWindowStore((state) => state.openApp);

    const [history, setHistory] = useState<Path[]>([START_PATH]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set([pathKey(HOME), pathKey(START_PATH)]));
    const [query, setQuery] = useState("");
    const [preview, setPreview] = useState<{ images: PreviewImage[]; index: number } | null>(null);
    const [lineCount, setLineCount] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const path = history[historyIndex];
    const node = resolve(tree, path);
    const project = node?.type === "directory" ? projectAt(path) : undefined;

    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0 });
    }, [path]);

    const label = (target: Path) =>
        target.length === 1 ? t("app.projects.home") : (projectAt(target)?.name ?? target[target.length - 1]);

    const goToHistory = (index: number) => {
        setHistoryIndex(index);
        setPreview(null);
        setQuery("");
    };

    const navigate = (target: Path) => {
        if (samePath(target, path)) return;

        const next = [...history.slice(0, historyIndex + 1), target];
        setHistory(next);
        goToHistory(next.length - 1);

        // Reveal the destination in the folder tree.
        setExpanded((prev) => {
            const nextExpanded = new Set(prev);
            for (let i = 1; i < target.length; i++) nextExpanded.add(pathKey(target.slice(0, i)));
            return nextExpanded;
        });
    };

    const toggle = (target: Path) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            const key = pathKey(target);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const entries =
        node?.type === "directory" && !project
            ? sortEntries(childrenOf(node, path), samePath(path, START_PATH))
            : [];
    const visible = entries.filter((entry) => matchesQuery(entry, query));

    const open = (entry: Entry) => {
        if (entry.node.type === "directory") return navigate(entry.path);

        const kind = fileKind(entry);
        if (kind === "app") {
            openApp(entry.node.appId!);
        } else if (kind === "pdf") {
            openApp("pdfviewer", { props: { fileName: { node: entry.node } } });
        } else if (kind === "image") {
            const images = visible.filter((e) => e.node.type === "file" && fileKind(e) === "image" && e.node.src);
            setPreview({
                images: images.map((e) => ({ src: e.node.src!, name: e.name })),
                index: Math.max(0, images.indexOf(entry)),
            });
        } else {
            navigate(entry.path);
        }
    };

    const status = () => {
        if (project) return t("app.projects.screenshotCount", { count: project.screenshots.length });
        if (node?.type === "file") return t("app.projects.lineCount", { count: lineCount });
        if (node) return t("app.projects.itemCount", { count: visible.length });
        return "";
    };

    const renderContent = () => {
        if (!node) {
            return (
                <div className="flex flex-col items-center gap-3 p-6 text-center text-sm">
                    <p className="opacity-60">{t("app.projects.missing")}</p>
                    <button className="btn-retro" onClick={() => navigate(HOME)}>
                        {t("app.projects.goHome")}
                    </button>
                </div>
            );
        }

        if (project) {
            return (
                <ProjectDetail
                    project={project}
                    onPreview={(index) =>
                        setPreview({
                            images: project.screenshots.map((s) => ({
                                src: s.src,
                                name: s.src.split("/").pop() ?? s.src,
                                caption: s.caption,
                            })),
                            index,
                        })
                    }
                />
            );
        }

        if (node.type === "file") return <TextFileView node={node} onLineCount={setLineCount} />;

        if (entries.length === 0) {
            return <p className="p-6 text-center text-sm opacity-60">{t("app.projects.emptyFolder")}</p>;
        }

        if (visible.length === 0) {
            return <p className="p-6 text-center text-sm opacity-60">{t("app.projects.noResults", { query })}</p>;
        }

        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
                {visible.map((entry) => (
                    <EntryTile key={entry.name} entry={entry} label={entry.node.title ?? label(entry.path)} onOpen={() => open(entry)} />
                ))}
            </div>
        );
    };

    const home = resolve(tree, HOME);
    const showSearch = node?.type === "directory" && !project;

    return (
        <div
            // Folder names etc. live in spans inside buttons; the global span rule would give them a text cursor.
            className="relative flex h-full min-h-0 w-full flex-col bg-[#F5E4C0] text-text-dark [container-type:inline-size] [&_button]:select-none [&_button_*]:cursor-hand"
            style={{ paddingBottom: bottomInset }}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b-2 border-sidebar bg-background px-2 py-1.5">
                <ToolbarButton
                    icon="icn-arrow-left"
                    label={t("app.projects.back")}
                    onClick={() => goToHistory(historyIndex - 1)}
                    disabled={historyIndex === 0}
                />
                <ToolbarButton
                    icon="icn-arrow-right"
                    label={t("app.projects.forward")}
                    onClick={() => goToHistory(historyIndex + 1)}
                    disabled={historyIndex === history.length - 1}
                />
                <ToolbarButton
                    icon="icn-arrow-up"
                    label={t("app.projects.up")}
                    onClick={() => navigate(path.slice(0, -1))}
                    disabled={path.length === 1}
                />

                <nav className="ml-1 flex min-w-0 flex-1 select-none items-center gap-1 overflow-hidden rounded border border-sidebar/50 bg-[#FFF8EA] px-2 py-0.5 text-xs [&_span]:cursor-arrow">
                    <AppIcon
                        icon={node ? entryIcon({ name: path[path.length - 1], path, node }) : "icn-folder"}
                        size="sm"
                        className="shrink-0"
                    />
                    {path.map((segment, i) => {
                        const target = path.slice(0, i + 1);
                        const last = i === path.length - 1;
                        return (
                            <span key={pathKey(target)} className="flex min-w-0 items-center gap-1">
                                {i > 0 && <span className="opacity-50">/</span>}
                                {last ? (
                                    <span className="truncate font-semibold">{segment === "~" ? "~" : label(target)}</span>
                                ) : (
                                    <button onClick={() => navigate(target)} className="shrink-0 hover:underline">
                                        {segment === "~" ? "~" : label(target)}
                                    </button>
                                )}
                            </span>
                        );
                    })}
                </nav>

                {showSearch && (
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("app.projects.searchPlaceholder")}
                        aria-label={t("app.projects.searchPlaceholder")}
                        className="hidden w-40 rounded border border-sidebar/50 bg-[#FFF8EA] px-2 py-0.5 text-xs outline-none focus:border-sidebar [@container(min-width:520px)]:block"
                    />
                )}
            </div>

            <div className="flex min-h-0 flex-1">
                {/* Folder tree */}
                <aside className="hidden w-52 shrink-0 overflow-y-auto border-r-2 border-sidebar py-2 text-xs [@container(min-width:640px)]:block">
                    {home && (
                        <ul>
                            <TreeItem
                                entry={{ name: "~", path: HOME, node: home }}
                                depth={0}
                                label={label}
                                current={path}
                                expanded={expanded}
                                onToggle={toggle}
                                onOpen={navigate}
                            />
                        </ul>
                    )}
                </aside>

                {/* Content */}
                <div ref={contentRef} className="min-w-0 flex-1 overflow-y-auto p-4">
                    {renderContent()}
                </div>
            </div>

            {/* Status bar */}
            <div className="flex select-none justify-between border-t-2 border-sidebar bg-background px-3 py-1 text-[11px] opacity-80 [&_span]:cursor-arrow">
                <span className="whitespace-nowrap">{status()}</span>
                {project && <span className="truncate pl-4">{project.stack.join(" · ")}</span>}
            </div>

            {preview && preview.images[preview.index] && (
                <ImagePreview
                    images={preview.images}
                    index={preview.index}
                    bottomInset={bottomInset}
                    onChange={(index) => setPreview({ ...preview, index })}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    );
};
