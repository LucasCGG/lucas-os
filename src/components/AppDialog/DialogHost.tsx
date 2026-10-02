import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useCrashStore } from "../../atoms";
import { useDialogStore } from "../../atoms/dialogs";
import type { OpenDialog } from "../../atoms/dialogs";
import { AppDialog } from "./AppDialog";
import { RANDOM_DIALOGS, sleepyDialog } from "./presets";

const CASCADE_PX = 24;
const RANDOM_MIN_MS = 2 * 60_000;
const RANDOM_MAX_MS = 5 * 60_000;
const IDLE_MS = 3 * 60_000;
const IDLE_CHECK_MS = 5_000;
const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

const FloatingDialog = ({ dialog, index, top }: { dialog: OpenDialog; index: number; top: boolean }) => {
    const close = useDialogStore((s) => s.close);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const startDrag = (e: PointerEvent<HTMLDivElement>) => {
        const origin = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        const move = (ev: globalThis.PointerEvent) =>
            setOffset({ x: ev.clientX - origin.x, y: ev.clientY - origin.y });
        const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    };

    const dismiss = () => {
        dialog.onClose?.();
        close(dialog.key);
    };

    return (
        <div
            className="pointer-events-auto absolute left-1/2 top-[40%]"
            style={{
                transform: `translate(-50%, -50%) translate(${offset.x + index * CASCADE_PX}px, ${
                    offset.y + index * CASCADE_PX
                }px)`,
            }}
        >
            <AppDialog
                title={dialog.title}
                message={dialog.message}
                icon={dialog.icon}
                inactive={!top}
                onClose={dismiss}
                onTitlePointerDown={startDrag}
                className={dialog.shake ? "animate-dialog-pop-shake" : "animate-dialog-pop"}
                buttons={(dialog.buttons ?? []).map((b, i, all) => ({
                    label: b.label,
                    autoFocus: top && i === all.length - 1,
                    onClick: () => {
                        b.onClick?.();
                        if (!b.keepOpen) close(dialog.key);
                    },
                }))}
            />
        </div>
    );
};

const useAmbientDialogs = () => {
    const lastActivity = useRef(0);

    useEffect(() => {
        const busy = () => {
            const { dialogs, sleeping } = useDialogStore.getState();
            return dialogs.length > 0 || sleeping || !!useCrashStore.getState().cause || document.hidden;
        };

        let last = -1;
        let timer: ReturnType<typeof setTimeout>;
        const schedule = () => {
            timer = setTimeout(() => {
                if (!busy()) {
                    // Never the same one twice in a row.
                    let pick = Math.floor(Math.random() * RANDOM_DIALOGS.length);
                    if (pick === last) pick = (pick + 1) % RANDOM_DIALOGS.length;
                    last = pick;
                    useDialogStore.getState().open(RANDOM_DIALOGS[pick]());
                }
                schedule();
            }, RANDOM_MIN_MS + Math.random() * (RANDOM_MAX_MS - RANDOM_MIN_MS));
        };
        schedule();
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        lastActivity.current = Date.now();
        const onActivity = () => (lastActivity.current = Date.now());
        ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

        const check = setInterval(() => {
            const { dialogs, sleeping, open } = useDialogStore.getState();
            if (sleeping || dialogs.length > 0 || useCrashStore.getState().cause) return;
            if (Date.now() - lastActivity.current < IDLE_MS) return;
            open(sleepyDialog());
        }, IDLE_CHECK_MS);

        return () => {
            ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
            clearInterval(check);
        };
    }, []);
}

const SleepScreen = () => {
    const setSleeping = useDialogStore((s) => s.setSleeping);

    useEffect(() => {
        const wake = () => setSleeping(false);
        const timer = setTimeout(() => {
            ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, wake));
        }, 600);
        return () => {
            clearTimeout(timer);
            ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, wake));
        };
    }, [setSleeping]);

    return (
        <div className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black text-text-muted">
            <span className="animate-pulse text-2xl">z z z</span>
        </div>
    );
};

export const DialogHost = () => {
    const dialogs = useDialogStore((s) => s.dialogs);
    const sleeping = useDialogStore((s) => s.sleeping);
    useAmbientDialogs();

    return (
        <div className="pointer-events-none fixed inset-0 z-[100000]">
            {dialogs.map((d, i) => (
                <FloatingDialog key={d.key} dialog={d} index={i} top={i === dialogs.length - 1} />
            ))}
            {sleeping && <SleepScreen />}
        </div>
    );
};
