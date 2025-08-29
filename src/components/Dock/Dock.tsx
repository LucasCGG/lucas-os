import { useEffect, useMemo, useRef, useState } from "react";
import { Rect, useWindowStore } from "../../store";
import { appsRegistry } from "../../apps";
import { AppIconButton } from "../AppIconButton";
import { AppIcon } from "../AppIcon";

const DockClock = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const tick = () => setNow(new Date());

        const n = new Date();
        const msToNextMin = (60 - n.getSeconds()) * 1000 - n.getMilliseconds();

        let intervalId: ReturnType<typeof setInterval> | undefined;
        const timeoutId = setTimeout(() => {
            tick();
            intervalId = setInterval(tick, 60_000);
        }, msToNextMin);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const { hours, minutes } = useMemo(() => {
        return {
            hours: now.toLocaleString([], { hour: "2-digit", hour12: false }),
            minutes: now.getMinutes().toString().padStart(2, "0"),
        };
    }, [now]);

    return (
        <div className="flex w-full flex-col items-center tabular-nums leading-none text-[#FFF4D6]">
            <span className="text-2xl">{hours}</span>
            <span className="text-2xl">{minutes}</span>
        </div>
    );
};

export const Dock = () => {
    const { openApp } = useWindowStore();

    const pinnedApps = useMemo(() => Object.values(appsRegistry).filter((app) => app.pinned), []);

    const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const openFromIcon = (appId: string) => {
        const desktop = document.getElementById("desktop-area");
        const iconEl = iconRefs.current[appId];

        if (!desktop || !iconEl) {
            openApp(appId);
            return;
        }

        const deskRect = desktop.getBoundingClientRect();
        const iconRect = iconEl.getBoundingClientRect();

        const sourceRect: Rect = {
            x: iconRect.left - deskRect.left,
            y: iconRect.top - deskRect.top,
            width: iconRect.width,
            height: iconRect.height,
        };

        openApp(appId, { sourceRect });
    };

    return (
        <aside className="flex w-20 flex-col items-center justify-between rounded-2xl bg-[#5D341A] px-3 py-4 text-white">
            <>
                <AppIcon size="auto" icon="icn-logo-simple" />

                <div className="flex flex-col justify-center gap-4">
                    {pinnedApps.map((app) => (
                        <div
                            key={app.id}
                            ref={(el) => {
                                iconRefs.current[app.id] = el;
                            }}
                            className="aspect-square w-full"
                        >
                            <AppIconButton
                                onClick={() => openFromIcon(app.id)}
                                icon={app.icon}
                                size="full"
                                className="aspect-square w-full overflow-hidden p-0"
                                variant="ghost"
                            />
                        </div>
                    ))}
                </div>
            </>

            <DockClock />
        </aside>
    );
};
