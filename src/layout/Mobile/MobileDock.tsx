// MobileDock.tsx
import { useMemo } from "react";
import { useWindowStore } from "../../atoms";
import { appsRegistry } from "../../apps";
import { AppIcon, AppIconButton } from "../../components";

interface MobileDockProps {
    activeAppId?: string;
    onHome: () => void;
}

export const MobileDock = ({ activeAppId, onHome }: MobileDockProps) => {
    const { openApp } = useWindowStore();

    const pinnedApps = useMemo(() => Object.values(appsRegistry).filter((app) => app.pinned), []);

    return (
        <nav className="flex w-full shrink-0 items-center justify-around gap-2 bg-[#5D341A] px-4 py-3">
            <button onClick={onHome} className="aspect-square w-10">
                <AppIcon size="full" icon="icn-logo-simple" />
            </button>

            {pinnedApps.map((app) => (
                <div key={app.id} className="relative">
                    <AppIconButton
                        onClick={() => openApp(app.id)}
                        icon={app.icon}
                        size="xl"
                        className="aspect-square overflow-hidden p-0"
                        variant="ghost"
                    />
                    {activeAppId === app.id && (
                        <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FFF4D6]" />
                    )}
                </div>
            ))}
        </nav>
    );
};
