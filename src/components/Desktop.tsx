import Dock from "./Dock";
import WindowManager from "./WindowManager";
import BackgroundImage from "../assets/BackgroundImage.png";
import { useWindowStore } from "../store";
import { appsRegistry } from "../apps";

export function Desktop() {
  const openApp = useWindowStore((state) => state.openApp);

  return (
    <div className="w-screen h-screen bg-[#5D341A] flex py-3">
      {/* Left Dock */}
      <div className="w-16 bg-[#5D341A] rounded-2xl flex flex-col items-center justify-between py-4 text-white">
        {/* Top icons */}
        <div className="space-y-4">
          <div className="text-2xl font-bold">LC</div>

          {Object.values(appsRegistry)
            .filter((app) => app.pinned)
            .map((app) => (
              <button
                key={app.id}
                title={app.title}
                onClick={() => openApp(app.id)}
                className="text-xl hover:scale-110 transition"
              >
                {app.icon}
              </button>
            ))}
        </div>

        {/* Bottom info */}
        <div className="space-y-4 text-xs">
          <div>📅</div>
          <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div>⚙️</div>
        </div>
      </div>

      {/* Main Frame */}
      <div
        id="desktop-area"
        className="flex-1 p-4 rounded-3xl overflow-hidden bg-neutral-100 shadow-inner relative"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <WindowManager />
      </div>
    </div>
  );
}