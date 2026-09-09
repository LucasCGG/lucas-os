import { useEffect } from "react";
import BackgroundImage from "../../assets/BackgroundImage.png";
import { appsRegistry } from "../../apps";
import { useWindowStore } from "../../atoms";
import { AppIcon } from "../../components";
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

    const isImmersive = Boolean(activeApp?.mobileImmersive);

    const goHome = () => activeWindow && minimizeApp(activeWindow.id);

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
            <div className="relative min-h-0 flex-1">
                {activeApp && activeWindow ? (
                    <MobileAppView>
                        <activeApp.component {...(activeWindow.props ?? {})} />
                    </MobileAppView>
                ) : (
                    <MobileHome />
                )}

                {isImmersive && (
                    <button
                        onClick={goHome}
                        aria-label="Exit to home screen"
                        className="absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-sm active:scale-90"
                        style={{ top: "max(12px, env(safe-area-inset-top))" }}
                    >
                        <AppIcon size="lg" icon="icn-logo-simple" />
                    </button>
                )}
            </div>

            {!isImmersive && <MobileDock activeAppId={activeWindow?.id} onHome={goHome} />}
        </div>
    );
};
