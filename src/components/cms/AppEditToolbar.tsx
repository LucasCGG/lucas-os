import React, { useRef } from "react";
import { useCmsStore } from "../../atoms/cmsStore";

export const AppEditToolbar: React.FC = () => {
    const editing = useCmsStore((s) => s.editing);
    const toggleEditing = useCmsStore((s) => s.toggleEditing);
    const exportJson = useCmsStore((s) => s.exportJson);
    const importJson = useCmsStore((s) => s.importJson);
    const revertEdits = useCmsStore((s) => s.revertEdits);
    const editsByLang = useCmsStore((s) => s.editsByLang);
    const lang = useCmsStore((s) => s.lang);
    const loadError = useCmsStore((s) => s.loadError);
    const fileRef = useRef<HTMLInputElement>(null);
    const hasEdits = Object.keys(editsByLang?.[lang] ?? {}).length > 0;

    const handleExport = () => {
        const blob = new Blob([exportJson()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${lang}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (!importJson(String(reader.result))) alert("That file couldn't be read as valid en.json.");
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleRevert = () => {
        if (confirm("Discard your local edits and go back to the published content?")) revertEdits();
    };

    return (
        <div className="cms-toolbar retro-window rounded-md">
            <div className="relative z-10 flex items-center gap-1.5">
                <button className="btn-retro" onClick={toggleEditing}
                    style={editing ? { background: "#7e57c2", color: "#fff" } : undefined}>
                    {editing ? "✓ Done" : "✎ Edit"}
                </button>

                {editing && (
                    <>
                        <button className="btn-retro" onClick={handleExport} title="Download en.json to publish">
                            Export en.json
                        </button>
                        <button className="btn-retro" onClick={() => fileRef.current?.click()} title="Preview an en.json">
                            Import
                        </button>
                        {hasEdits && (
                            <button className="btn-retro" onClick={handleRevert} title="Discard local edits" style={{ color: "#a11" }}>
                                Revert
                            </button>
                        )}
                        {hasEdits && (
                            <span className="ml-1 text-xs font-semibold" style={{ color: "#7e57c2" }} title="Unpublished local edits">
                                unpublished
                            </span>
                        )}
                        {loadError && (
                            <span className="ml-1 text-xs" style={{ color: "#a11" }} title={`en.json didn't load (${loadError})`}>
                                using fallback
                            </span>
                        )}
                        <input ref={fileRef} type="file" accept="application/json,.json"
                            onChange={handleImportFile} style={{ display: "none" }} />
                    </>
                )}
            </div>
        </div>
    );
};
