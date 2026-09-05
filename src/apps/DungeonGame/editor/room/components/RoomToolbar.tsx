import { RoomTool } from "../types/RoomEditorState";
import { DECOR_ASSETS } from "../../../objects/Decoration";

interface RoomToolbarProps {
  tool: RoomTool;
  onToolChange: (tool: RoomTool) => void;
  decorKind: string;
  onDecorKindChange: (kind: string) => void;
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
  decorKind,
  onDecorKindChange,
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
        label="✿ Decoration"
        active={tool === "decoration"}
        onClick={() => onToolChange("decoration")}
      />

      {tool === "decoration" && (
        <select
          value={decorKind}
          onChange={(event) => onDecorKindChange(event.target.value)}
          className="
            mx-2
            mb-1
            rounded
            border
            border-white/15
            bg-black/30
            px-2
            py-1
            text-xs
            text-white/80
            outline-none
            focus:border-emerald-400
          "
        >
          {Object.keys(DECOR_ASSETS).map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      )}

      <div className="my-1 border-t border-white/10" />

      <span className="px-2 py-1 text-[10px] font-semibold tracking-widest text-white/40">
        FLOOR PLAN
      </span>

      <ToolButton
        label="▦ Floor area"
        active={tool === "floor"}
        onClick={() => onToolChange("floor")}
      />

      <ToolButton
        label="~ Water area"
        active={tool === "water"}
        onClick={() => onToolChange("water")}
      />

      <div className="px-2 text-[11px] leading-relaxed text-white/35">
        Drag a floor area to carve a corridor shape — the rest of the room
        becomes non-floor (void). Leave floor areas empty for an ordinary
        full-rectangle room. Water areas are always floor too.
      </div>

      <div className="my-1 border-t border-white/10" />

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
