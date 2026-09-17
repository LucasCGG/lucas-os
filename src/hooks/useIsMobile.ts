import { useEffect, useState } from "react";
import { isMobileDevice } from "../apps/DungeonGame/utils/isMobileDevice";

export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(() => isMobileDevice());

    useEffect(() => {
        const update = (): void => setIsMobile(isMobileDevice());
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return isMobile;
};
