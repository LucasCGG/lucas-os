import  { FC, useEffect } from "react";
import { useCmsStore } from "../../atoms/cmsStore";
import { AppEditPanel } from "./AppEditPanel";
import { AppEditToolbar } from "./AppEditToolbar";

export const CmsLayer: FC = () => {
    const init = useCmsStore((s) => s.init);
    const loaded = useCmsStore((s) => s.loaded);
    const editing = useCmsStore((s) => s.editing);
    const selectedId = useCmsStore((s) => s.selectedId);
    const select = useCmsStore((s) => s.select);
    const setEditing = useCmsStore((s) => s.setEditing);

    useEffect(() => {
        if (!loaded) void init();
    }, [loaded, init]);

    useEffect(() => {
        if (!editing) return;
        const onClick = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (t.closest(".cms-editable") || t.closest(".cms-panel") || t.closest(".cms-toolbar")) return;
            select(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (selectedId) select(null);
            else setEditing(false);
        };
        document.addEventListener("click", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("click", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [editing, selectedId, select, setEditing]);

    return (
        <>
            <AppEditToolbar />
            <AppEditPanel/>
        </>
    );
};
