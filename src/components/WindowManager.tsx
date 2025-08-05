import { appsRegistry } from "../apps";
import { useWindowStore } from "../store";
import Window from "./Window/Window";




export default function WindowManager() {
    const { openWindows, closeApp, bringToFront } = useWindowStore();

    return (
        <>
            {openWindows.map(({ id, zIndex }) => {
                const app = appsRegistry[id];
                if (!app) return null;
                const AppComponent = app.component;
                return (
                    <Window
                        appId={id}
                        title={app.title}
                        zIndex={zIndex}
                        onClose={() => closeApp(id)}
                        onFocus={() => bringToFront(id)}
                        defaultSize={app.defaultSize}
                    >
                        <AppComponent />
                    </Window>
                );
            })}
        </>
    );
}
