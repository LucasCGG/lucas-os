import { useEffect } from "react";
import BackgroundImage from "../../assets/BackgroundImage.png";
import { Dock, WindowManager } from "../../components";
import { CmsLayer } from "../../components/cms";
import { useAuthCtx } from "../../contexts";

export const Desktop = () => {
  const { allowEdit } = useAuthCtx();

  useEffect(() => {
    console.debug("allowEdit", allowEdit);
  },[allowEdit])

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
                <WindowManager defaultApp="about" />


                {allowEdit && (
                  <CmsLayer />
                )}
            </div>
        </div>
    );
};
