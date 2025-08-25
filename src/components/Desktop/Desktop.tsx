// Desktop.tsx
import { Dock } from "../Dock";
import { WindowManager } from "../WindowManager";
import BackgroundImage from "../../assets/BackgroundImage.png";

export const Desktop = () => {
    return (
        <div className="flex h-screen w-screen bg-[#5D341A] py-3 pr-3">
            {/* Left Dock */}
            <Dock />

            {/* Main Frame */}
            <div
                id="desktop-area"
                className="relative flex-1 overflow-hidden rounded-3xl bg-neutral-100 p-4 shadow-inner"
                style={{
                    backgroundImage: `url(${BackgroundImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* FX overlay for ghost animations */}
                <div id="fx-layer" className="pointer-events-none absolute inset-0 z-[99999]" />
                <WindowManager />
            </div>
        </div>
    );
};
