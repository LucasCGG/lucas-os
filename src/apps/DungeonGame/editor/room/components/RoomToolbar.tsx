import { RoomTool } from "./types/RoomEditorState";

interface RoomToolbarProps {
  tool: RoomTool;
  onToolChange: (tool: RoomTool) => void;
}

interface ToolButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ToolButton({
  label,
  active,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded px-3 py-2 text-left text-sm transition
        ${
          active
            ? "bg-emerald-500/20 text-emerald-200"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      {label}
    </button>
  );
}

export function RoomToolbar({
  tool,
  onToolChange,
}: RoomToolbarProps) {
  return (
    <div className="flex flex-col gap-1 p-2">
      <span className="px-2 py-1 text-[10px] font-semibold tracking-widest text-white/40">
        TOOLS
      </span>

      <ToolButton
        label="↖ Select"
        active={tool === "select"}
        onClick={() => onToolChange("select")}
      />

      <ToolButton
        label="▭ Wall"
        active={tool === "wall"}
        onClick={() => onToolChange("wall")}
      />

      <ToolButton
        label="● Pillar"
        active={tool === "pillar"}
        onClick={() => onToolChange("pillar")}
      />

      <ToolButton
        label="▣ Chest"
        active={tool === "chest"}
        onClick={() => onToolChange("chest")}
      />

      <ToolButton
        label="⌫ Erase"
        active={tool === "erase"}
        onClick={() => onToolChange("erase")}
      />

      <div className="my-2 border-t border-white/10" />

      <div className="px-2 text-xs leading-relaxed text-white/40">
        <div>Scroll: zoom</div>
        <div>Middle mouse: pan</div>
        <div>Delete: remove selected</div>
      </div>
    </div>
  );
}
