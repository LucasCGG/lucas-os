import React, { FC, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import { appsRegistry } from "../../apps";
import { useWindowStore } from "../../store";
import type { Rect } from "../../store";
import { Window } from "../Window/Window";

const useFxLayer = () => {
    const [el, setEl] = React.useState<HTMLElement | null>(null);
    useEffect(() => {
        setEl(document.getElementById("fx-layer"));
    }, []);
    return el;
};

type GhostProps = {
    appId: string;
    target: Rect;
    source: Rect;
    zIndex: number;
    onDone: () => void;
};

const GhostWindow: FC<GhostProps> = ({ appId, target, source, zIndex, onDone }) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            onDone();
            return;
        }

        Object.assign(el.style, {
            position: "absolute",
            left: `${target.x}px`,
            top: `${target.y}px`,
            width: `${target.width}px`,
            height: `${target.height}px`,
            transformOrigin: "0 0",
            zIndex: String(zIndex),
        });

        const dx = source.x - target.x;
        const dy = source.y - target.y;
        const sx = source.width / target.width;
        const sy = source.height / target.height;

        const sweep = el.querySelector(".ghost-sweep") as HTMLDivElement | null;

        const tl = gsap.timeline({
            defaults: { duration: 0.6, ease: "power2.out" },
            onComplete: onDone,
        });

        tl.fromTo(
            el,
            { x: dx, y: dy, scaleX: sx, scaleY: sy, rotateX: 0.6, rotateY: -0.4, opacity: 0.98 },
            { x: 0, y: 0, scaleX: 1, scaleY: 1, rotateX: 0, rotateY: 0, opacity: 1 }
        )

            .to(el, { duration: 0.12, scale: 1.012 }, "<")
            .to(el, { duration: 0.12, scale: 1 }, ">-0.02");

        if (sweep) {
            tl.fromTo(
                sweep,
                { x: "-120%" },
                { x: "120%", duration: 0.22, ease: "sine.out" },
                "-=0.28"
            );
        }

        return () => {
            tl.kill();
        };
    }, [appId, target, source, zIndex, onDone]);

    return (
        <div ref={ref} className="pointer-events-none">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/20 bg-white/20 shadow-md backdrop-blur-xl">
                <div className="flex h-8 items-center bg-sidebar px-3 text-sm text-text-muted opacity-95">
                    Launching…
                </div>
                <div
                    className="ghost-sweep pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                        mixBlendMode: "screen",
                    }}
                />

                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 2px)",
                        mixBlendMode: "multiply",
                    }}
                />
            </div>
        </div>
    );
};

export const WindowManager = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fxLayer = useFxLayer();

    const { openWindows, closeApp, bringToFront, updateWindow } = useWindowStore();

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            const { openWindows: windows } = useWindowStore.getState();

            windows.forEach((w) => {
                if (w.isAnimating) return; // <-- important guard
                const newX = Math.max(0, Math.min(w.position.x, width - w.size.width));
                const newY = Math.max(0, Math.min(w.position.y, height - w.size.height));
                const newWidth = Math.min(w.size.width, width);
                const newHeight = Math.min(w.size.height, height);

                updateWindow(w.id, {
                    position: { x: newX, y: newY },
                    size: { width: newWidth, height: newHeight },
                });
            });
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [updateWindow]);

    const renderOpenWindow = useMemo(
        () =>
            openWindows
                .filter((w) => !w.isMinimized)
                .map(({ id, zIndex }) => {
                    const app = appsRegistry[id];
                    if (!app) return null;
                    const AppComponent = app.component;

                    const wData = openWindows.find((w) => w.id === id)!;
                    const hidden = wData.isLaunching;
                    const animating = wData.isAnimating;

                    return (
                        <Window
                            key={id}
                            appId={id}
                            title={app.title}
                            zIndex={zIndex}
                            onClose={() => closeApp(id)}
                            onFocus={() => bringToFront(id)}
                            defaultSize={app.defaultSize}
                            __animHidden={hidden}
                            __animDisabled={animating}
                        >
                            <AppComponent />
                        </Window>
                    );
                }),
        [openWindows, bringToFront, closeApp]
    );

    const launching = openWindows.filter((w) => w.isLaunching && w.launchFrom);

    const ghostPortals = useMemo(() => {
        if (!fxLayer) return null;

        return launching.map((w) => {
            const target: Rect = {
                x: w.position.x,
                y: w.position.y,
                width: w.size.width,
                height: w.size.height,
            };
            const source = w.launchFrom as Rect;
            const onDone = () => {
                useWindowStore.getState().bringToFront(w.id);
                useWindowStore.getState().updateWindow(w.id, {
                    isLaunching: false,
                    isAnimating: false,
                    launchFrom: null,
                });
            };

            if (!w.isAnimating) {
                updateWindow(w.id, { isAnimating: true });
            }

            const zTop = Math.max(w.zIndex, useWindowStore.getState().highestZIndex + 2);

            return ReactDOM.createPortal(
                <GhostWindow
                    key={`ghost-${w.id}`}
                    appId={w.id}
                    target={target}
                    source={source}
                    zIndex={zTop}
                    onDone={onDone}
                />,
                fxLayer
            );
        });
    }, [fxLayer, launching, updateWindow]);

    return (
        <div
            ref={containerRef}
            id="window-positioner"
            className="relative h-full flex-1 overflow-hidden"
        >
            {renderOpenWindow}
            {ghostPortals}
        </div>
    );
};
