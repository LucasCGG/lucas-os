import { AppCustomWaitCursor, Desktop } from "./components";
import useDynamicTabTitle from "./utils/useDynamicTitle";
import { useEffect, useState } from "react";

export const App = () => {
    useDynamicTabTitle();

    const hasVisited = localStorage.getItem("lucasOS_hasVisited");
    const [showMessage, setShowMessage] = useState(!hasVisited);

    useEffect(() => {
        if (!hasVisited) {
            const timer = setTimeout(() => {
                setShowMessage(false);
                localStorage.setItem("lucasOS_hasVisited", "true");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasVisited]);

    if (showMessage) {
        return (
            <div
                style={{ height: "100vh", width: "100vw" }}
                className="bg-terminal_background flex flex-col items-center justify-center"
            >
                <h3 className="text-terminal_foreground w-fit">
                    For the currently best Experience, please use a Desktop
                </h3>
                <p className="text-terminal_foreground w-fit"> Enjoy ;P</p>
            </div>
        );
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
