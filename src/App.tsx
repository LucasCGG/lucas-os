import { AppCustomWaitCursor, Desktop } from "./components";
import { RetroStart } from "./components/RetroStartup/RetroStartup";
import useDynamicTabTitle from "./utils/useDynamicTitle";
import { useEffect, useState } from "react";

export const App = () => {
    useDynamicTabTitle();

    const hasVisited = localStorage.getItem("lucasOS_hasVisited");
    const [showMessage, setShowMessage] = useState(!hasVisited);
    const [showStarter, setShowStart] = useState(true);

    useEffect(() => {
        if (!hasVisited) {
            const timer = setTimeout(() => {
                setShowMessage(false);
                localStorage.setItem("lucasOS_hasVisited", "true");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasVisited]);

    useEffect(() => {
        if (hasVisited && showStarter) {
            const timer = setTimeout(() => {
                setShowStart(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showStarter, hasVisited]);

    if (showMessage) {
        return 
            <div
                style={{ height: "100vh", width: "100vw" }}
                className="flex flex-col items-center justify-center bg-terminal_background"
            >
                <h3 className="w-fit text-terminal_foreground">
                    For the currently best Experience, please use a Desktop
                </h3>
                <p className="w-fit text-terminal_foreground"> Enjoy ;P</p>
            </div>
        );
    }

    if (showStarter) {
        return <RetroStart />;
    }

    return (
        <>
            <AppCustomWaitCursor />
            <div className="h-screen w-screen overflow-hidden">
                <Desktop />
            </div>
        </>
    );
};
