import { useEffect } from "react";
import BackgroundImage from "../../assets/BackgroundImage.png";
import { appsRegistry } from "../../apps";
import { useWindowStore } from "../../atoms";
import { MobileAppView } from "./MobileAppView";
import { MobileDock } from "./MobileDock";
import { MobileHome } from "./MobileHome";

export const Mobile = () => {
    const { openWindows, minimizeApp } = useWindowStore();

    useEffect(() => {
        const initialAbout = useWindowStore
            .getState()
            .openWindows.find((w) => w.id === "about" && w.zIndex === 0 && !w.isMinimized);

        if (initialAbout) minimizeApp("about");
    }, [minimizeApp]);

    const activeWindow = openWindows
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

    const activeApp = activeWindow ? appsRegistry[activeWindow.id] : undefined;

    return (
        <div
            className="flex h-full w-full flex-col overflow-hidden bg-neutral-100"
            style={{
                backgroundImage: `url(${BackgroundImage})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="min-h-0 flex-1">
                {activeApp && activeWindow ? (
                    <MobileAppView>
                        <activeApp.component {...(activeWindow.props ?? {})} />
                    </MobileAppView>
                ) : (
                    <MobileHome />
                )}
            </div>

            <MobileDock
                activeAppId={activeWindow?.id}
                onHome={() => activeWindow && minimizeApp(activeWindow.id)}
            />
        </div>
    );
};
