// MobileHome.tsx
import { useMemo } from "react";
import { useWindowStore } from "../../atoms";
import { appsRegistry } from "../../apps";
import { AppIcon } from "../../components";

export const MobileHome = () => {
    const { openApp } = useWindowStore();

    const apps = useMemo(() => Object.values(appsRegistry).filter((app) => app.icon), []);

    return (
        <div className="h-full w-full overflow-y-auto p-6">
            <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                {apps.map((app) => (
                    <button
                        key={app.id}
                        onClick={() => openApp(app.id)}
                        className="flex flex-col items-center gap-1"
                    >
                        <AppIcon icon={app.icon} size="2xl" className="drop-shadow-md" />
                        <span className="w-full truncate text-center text-xs text-[#FFF4D6]">
                            {app.title}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
