import { Rnd } from 'react-rnd';
import { useWindowStore } from '../../store';
import { AppTruncatingTooltipText } from '../AppTruncatingTooltipText/AppTruncatingTooltipText';
import { AppIconButton } from '../AppIconButton';
import { useMemo } from 'react';

interface WindowProps {
  appId: string;
  title: string;
  zIndex: number;
  children: React.ReactNode;
  onClose: () => void;
  defaultSize: { width: number; height: number };
  onFocus: () => void;
}

export const Window = ({
  appId,
  title,
  zIndex,
  children,
  onClose,
  defaultSize,
  onFocus,
}: WindowProps) => {
  const { updateWindow, minimizeApp, toggleFullscreenApp } = useWindowStore();

  const windowData = useWindowStore((state) => state.openWindows.find((w) => w.id === appId));

  const isFullscreen = windowData?.isFullscreen;
  const isMinimized = windowData?.isMinimized;

  if (isMinimized) return null;

  const size = isFullscreen ? { width: '100%', height: '100%' } : windowData?.size || defaultSize;

  const position = isFullscreen ? { x: 0, y: 0 } : windowData?.position || { x: 100, y: 100 };

  return (
    <Rnd
      size={size}
      position={position}
      disableDragging={isFullscreen}
      enableResizing={!isFullscreen}
      minWidth={300}
      minHeight={200}
      onDragStop={(e, d) => updateWindow(appId, { position: { x: d.x, y: d.y } })}
      onResize={(e, dir, ref, delta, position) => {
        updateWindow(appId, {
          size: { width: ref.offsetWidth, height: ref.offsetHeight },
          position,
        });
      }}
      bounds="#window-positioner"
      style={{ zIndex }}
      onMouseDown={onFocus}
      className="retro-window absolute overflow-hidden rounded-xl border-accent_blue bg-transparent shadow-md backdrop-blur-xl"
      dragHandleClassName="window-titlebar"
      resizeHandleClasses={{
        right: 'cursor-ew-imp',
        left: 'cursor-ew-imp',
        top: 'cursor-ns-imp',
        bottom: 'cursor-ns-imp',
        bottomRight: 'cursor-nwse-imp',
        topLeft: 'cursor-nwse-imp',
        bottomLeft: 'cursor-nesw-imp',
        topRight: 'cursor-nesw-imp',
      }}
    >
      {useMemo(
        () => (
          <div className="window-titlebar text-md flex cursor-move items-center justify-between bg-sidebar px-3 py-2 font-medium text-text-muted">
            <AppTruncatingTooltipText as="p">{title}</AppTruncatingTooltipText>
            <div className="flex gap-2">
              <AppIconButton size="sm" icon="icn-minimize" onClick={() => minimizeApp(appId)} />
              <AppIconButton
                size="sm"
                icon="icn-fullscreen"
                onClick={() => toggleFullscreenApp(appId)}
              />
              <AppIconButton size="sm" icon="icn-close" onClick={onClose} />
            </div>
          </div>
        ),
        [appId]
      )}
      <div className="h-full">{children}</div>
    </Rnd>
  );
};
