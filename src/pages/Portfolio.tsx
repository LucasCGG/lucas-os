import { useEffect, useMemo, useState } from "react";
import { AppCustomWaitCursor, Desktop } from "../components";
import { RetroStart } from "../components/RetroStartup/RetroStartup";
import useDynamicTabTitle from "../utils/useDynamicTitle";

export const Portfolio = () => {
    useDynamicTabTitle();

    const initialHasVisited = useMemo(
        () =>
            typeof window !== "undefined" &&
            window.localStorage.getItem("lucasOS_hasVisited") === "true",
        []
    );

    const [hasVisited, setHasVisited] = useState<boolean>(initialHasVisited);
    const [showMessage, setShowMessage] = useState<boolean>(() => !initialHasVisited);
    const [showStarter, setShowStarter] = useState<boolean>(true);

    useEffect(() => {
        if (!hasVisited) {
            const timer = setTimeout(() => {
                setShowMessage(false);
                try {
                    window.localStorage.setItem("lucasOS_hasVisited", "true");
                    setHasVisited(true);
                } catch {
                    /* ignore */
                }
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [hasVisited]);

    useEffect(() => {
        if (hasVisited && showStarter) {
            const timer = setTimeout(() => setShowStarter(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [hasVisited, showStarter]);

    if (showMessage) {
        return (
            <div
                style={{ height: "100vh", width: "100vw" }}
                className="flex flex-col items-center justify-center bg-terminal_background"
            >
                <h3 className="w-fit text-terminal_foreground">
                    For the currently best Experience, please use a Desktop
                </h3>
                <p className="w-fit text-terminal_foreground">Enjoy ;P</p>
            </div>
        );
    }

    if (showStarter) return <RetroStart />;

    return (
        <>
            <AppCustomWaitCursor />
            <div className="h-screen w-screen overflow-hidden">
                <Desktop />
            </div>
        </>
    );
};
