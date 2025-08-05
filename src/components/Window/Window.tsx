import { Rnd } from "react-rnd";
import { useWindowStore } from "../../store";
import { TruncatingTooltipText } from "../TruncatingToolTip";

export default function Window({ appId, title, zIndex, children, onClose, defaultSize, onFocus }) {
    const updateWindow = useWindowStore((state) => state.updateWindow);

    const windowData = useWindowStore((state) =>
        state.openWindows.find((w) => w.id === appId)
    );

    return (
        <Rnd
            size={windowData?.size}
            position={windowData?.position}
            onDragStop={(e, d) =>
                updateWindow(appId, { position: { x: d.x, y: d.y } })
            }
            onResizeStop={(e, dir, ref, delta, position) =>
                updateWindow(appId, {
                    size: { width: ref.offsetWidth, height: ref.offsetHeight },
                    position
                })
            }
            bounds="#desktop-area"
            style={{ zIndex, background: "red" }}
            onMouseDown={onFocus}
            className="absolute bg-neutral-800 border-4 border-accent_blue rounded-md shadow-md overflow-hidden"
            dragHandleClassName="window-title"
        >

            <div className="window-title flex justify-between items-center bg-sidebar text-text-muted px-3 py-1 font-medium text-md cursor-move">
                <TruncatingTooltipText as="p">{title}</TruncatingTooltipText>
                <button onClick={onClose}>✕</button>
            </div>
            <div className="p-2">{children}</div>
        </Rnd >
    );
}
