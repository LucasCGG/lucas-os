import { useEffect, useMemo, useRef } from 'react';
import { appsRegistry } from '../../apps';
import { useWindowStore } from '../../store';
import { Window } from '../Window/Window';

export const WindowManager = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { openWindows, closeApp, bringToFront, updateWindow } = useWindowStore();

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      useWindowStore.getState().openWindows.forEach((w) => {
        let newX = Math.min(w.position.x, width - w.size.width);
        let newY = Math.min(w.position.y, height - w.size.height);
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;

        let newWidth = Math.min(w.size.width, width);
        let newHeight = Math.min(w.size.height, height);

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
          return (
            <Window
              key={id}
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
        }),
    [openWindows]
  );

  return (
    <div
      ref={containerRef}
      id="window-positioner"
      className="relative h-full flex-1 overflow-hidden"
    >
      {renderOpenWindow}
    </div>
  );
};
