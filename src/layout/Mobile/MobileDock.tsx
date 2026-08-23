// MobileDock.tsx
import { ReactNode, useMemo } from "react";
import { useWindowStore } from "../../atoms";
import { appsRegistry } from "../../apps";
import { AppIcon, AppIconButton } from "../../components";

interface MobileDockProps {
    activeAppId?: string;
    onHome: () => void;
}

export const MobileDock = ({ activeAppId, onHome }: MobileDockProps) => {
    const { openApp, minimizeApp, openWindows } = useWindowStore();

    const pinnedApps = useMemo(
        () =>
            Object.values(appsRegistry)
                .slice(0, 4)
                .filter((app) => app.pinned),
        [appsRegistry]
    );

    const handleToggleApp = (id: string) => {
        const target = openWindows.find((w) => w.id === id);

        if (target && !target.isMinimized && activeAppId === id) {
            minimizeApp(id);
            return;
        }

        openWindows.forEach((w) => {
            if (w.id !== id && !w.isMinimized) {
                minimizeApp(w.id);
            }
        });
        openApp(id);
    };

    const renderAppButton = (app) => (
        <div key={app.id} className="relative">
            <AppIconButton
                onClick={() => handleToggleApp(app.id)}
                icon={app.icon}
                size="3xl"
                className="aspect-square overflow-hidden p-0"
                variant="ghost"
            />
            {activeAppId === app.id && (
                <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FFF4D6]" />
            )}
        </div>
    );

    return (
        <nav className="flex w-full shrink-0 items-baseline justify-around gap-2 bg-[#5D341A] px-4 py-3">
            {pinnedApps.slice(0, 2).map((app) => renderAppButton(app))}
            <button onClick={onHome}>
                <AppIcon size="3xl" icon="icn-logo-simple" />
            </button>
            {pinnedApps.slice(2, 4).map((app) => renderAppButton(app))}
        </nav>
    );
};
