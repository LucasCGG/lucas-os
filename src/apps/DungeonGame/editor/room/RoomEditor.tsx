import { useState } from "react";

import { RoomTemplate } from "../../scenes/RoomTemplate";

import {
  EditorSelection,
  RoomTool,
} from "./types/RoomEditorState";

import { AppIconButton } from "../../../../components";
import { RoomToolbar } from "./components/RoomToolbar";
import { RoomCanvas } from "./RoomCanvas";
import { RoomInspector } from "./components/RoomInspector";
import { RoomExporter } from "./components/RoomExporter";

interface RoomEditorProps {
  onClose: () => void;
}

export const RoomEditor = ({
  onClose,
}: RoomEditorProps) => {
  const [room, setRoom] =
    useState<RoomTemplate>({
      id: "room_new",

      width: 800,
      height: 600,

      wallThickness: 40,
      doorWidth: 120,

      walls: [],
      pillars: [],
      chestSpots: [],

      doors: [],

      tags: [],
    });

  const [tool, setTool] =
    useState<RoomTool>("select");

  const [selected, setSelected] =
    useState<EditorSelection>({
      type: null,
      index: -1,
    });

  return (
    <div
      className="
        absolute
        inset-2
        top-12
        z-20
        flex
        overflow-hidden
        rounded-lg
        border
        border-white/15
        bg-[#12121a]
        text-white
        shadow-xl
      "
    >
      {/* LEFT TOOLBAR */}

      <div
        className="
          flex
          w-52
          flex-col
          border-r
          border-white/10
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            p-3
          "
        >
          <span
            className="
              text-sm
              font-semibold
            "
          >
            ◈ ROOM EDITOR
          </span>

          <AppIconButton
            icon="icn-close"
            onClick={onClose}
          />
        </div>

        <RoomToolbar
          tool={tool}
          onToolChange={setTool}
        />
      </div>

      {/* CANVAS */}

      <div
        className="
          relative
          flex
          min-w-0
          flex-1
        "
      >
        <RoomCanvas
          room={room}
          setRoom={setRoom}
          tool={tool}
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      {/* RIGHT INSPECTOR */}

      <div
        className="
          flex
          w-72
          flex-col
          border-l
          border-white/10
        "
      >
        <div className="min-h-0 flex-1">
          <RoomInspector
            room={room}
            setRoom={setRoom}
            selected={selected}
          />
        </div>

        <RoomExporter
          room={room}
        />
      </div>

    </div>
  );
};
