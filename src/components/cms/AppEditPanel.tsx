import { FC } from "react";
import { useCmsStore } from "../../atoms/cmsStore";

type TimelineEntry = { year: string; title: string; sub: string };

export const AppEditPanel: FC = () => {
    const editing = useCmsStore((s) => s.editing);
    const selectedId = useCmsStore((s) => s.selectedId);
    const fields = useCmsStore((s) => s.fields);
    const update = useCmsStore((s) => s.update);
    const select = useCmsStore((s) => s.select);

    if (!editing || !selectedId) return null;
    const field = fields[selectedId];
    if (!field) return null;

    return (
        <div className="cms-panel retro-window rounded-md" onClick={(e) => e.stopPropagation()}>
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <h3>{field.label}</h3>
                    <button
                        className="cms-mini-btn"
                        onClick={() => select(null)}
                        aria-label="Close editor"
                    >
                        ✕
                    </button>
                </div>

                {field.type === "text" && (
                    <input
                        className="cms-input"
                        value={String(field.value ?? "")}
                        autoFocus
                        onChange={(e) => update(selectedId, e.target.value)}
                    />
                )}

                {field.type === "longtext" && (
                    <textarea
                        className="cms-textarea"
                        value={String(field.value ?? "")}
                        autoFocus
                        onChange={(e) => update(selectedId, e.target.value)}
                    />
                )}

                {field.type === "number" && (
                    <input
                        className="cms-input"
                        type="number"
                        value={Number(field.value ?? 0)}
                        autoFocus
                        onChange={(e) => update(selectedId, Number(e.target.value))}
                    />
                )}

                {field.type === "list" && (
                    <AppListEditor
                        values={(field.value as string[]) ?? []}
                        onChange={(next) => update(selectedId, next)}
                    />
                )}

                {field.type === "timeline" && (
                    <AppTimelineEditor
                        entries={(field.value as TimelineEntry[]) ?? []}
                        onChange={(next) => update(selectedId, next)}
                    />
                )}

                <p className="cms-hint">
                    Changes save automatically to this browser. Use Export in the toolbar to publish.
                </p>
            </div>
        </div>
    );
};

const AppListEditor: FC<{ values: string[]; onChange: (next: string[]) => void }> = ({
    values,
    onChange,
}) => {
    const setAt = (i: number, v: string) => {
        const next = [...values];
        next[i] = v;
        onChange(next);
    };
    const removeAt = (i: number) => onChange(values.filter((_, idx) => idx !== i));
    const add = () => onChange([...values, "New item"]);
    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= values.length) return;
        const next = [...values];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };

    return (
        <div>
            {values.map((v, i) => (
                <div className="cms-row" key={i}>
                    <input className="cms-input" value={v} onChange={(e) => setAt(i, e.target.value)} />
                    <button className="cms-mini-btn" onClick={() => move(i, -1)} title="Move up">
                        ↑
                    </button>
                    <button className="cms-mini-btn" onClick={() => move(i, 1)} title="Move down">
                        ↓
                    </button>
                    <button
                        className="cms-mini-btn cms-mini-btn--danger"
                        onClick={() => removeAt(i)}
                        title="Remove"
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button className="cms-mini-btn" onClick={add} style={{ marginTop: 4 }}>
                + Add item
            </button>
        </div>
    );
};

const AppTimelineEditor: FC<{
    entries: TimelineEntry[];
    onChange: (next: TimelineEntry[]) => void;
}> = ({ entries, onChange }) => {
    const setField = (i: number, key: keyof TimelineEntry, v: string) =>
        onChange(entries.map((e, idx) => (idx === i ? { ...e, [key]: v } : e)));
    const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i));
    const add = () => onChange([...entries, { year: "New", title: "New entry", sub: "Description" }]);
    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= entries.length) return;
        const next = [...entries];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };

    return (
        <div>
            {entries.map((e, i) => (
                <div className="cms-timeline-item" key={i}>
                    <label>Year</label>
                    <input
                        className="cms-input"
                        value={e.year}
                        onChange={(ev) => setField(i, "year", ev.target.value)}
                    />
                    <label>Title</label>
                    <input
                        className="cms-input"
                        value={e.title}
                        onChange={(ev) => setField(i, "title", ev.target.value)}
                    />
                    <label>Description</label>
                    <textarea
                        className="cms-textarea"
                        style={{ minHeight: 54 }}
                        value={e.sub}
                        onChange={(ev) => setField(i, "sub", ev.target.value)}
                    />
                    <div className="cms-row" style={{ marginTop: 4 }}>
                        <button className="cms-mini-btn" onClick={() => move(i, -1)}>
                            ↑
                        </button>
                        <button className="cms-mini-btn" onClick={() => move(i, 1)}>
                            ↓
                        </button>
                        <button
                            className="cms-mini-btn cms-mini-btn--danger"
                            onClick={() => remove(i)}
                            style={{ marginLeft: "auto" }}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
            <button className="cms-mini-btn" onClick={add}>
                + Add entry
            </button>
        </div>
    );
};
