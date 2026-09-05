import {
  Dispatch,
  SetStateAction,
} from "react";
import { Direction, RoomTemplate } from "../../../scenes/RoomTemplate";
import { EditorSelection } from "../types/RoomEditorState";
import { SelectedObjectInspector } from "./SelectedObjectInspector";


interface RoomInspectorProps {
  room: RoomTemplate;

  setRoom: Dispatch<
    SetStateAction<RoomTemplate>
  >;

  selected: EditorSelection;
}

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;

  onChange: (
    value: number,
  ) => void;
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-20 text-xs text-white/50">
        {label}
      </span>

      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ) || 0,
          )
        }
        className="
          w-full
          rounded
          border
          border-white/15
          bg-black/30
          px-2
          py-1
          text-sm
          outline-none
          focus:border-emerald-400
        "
      />
    </label>
  );
}

export function RoomInspector({
  room,
  setRoom,
  selected,
}: RoomInspectorProps) {
  const updateRoom =
    <K extends keyof RoomTemplate>(
      key: K,
      value: RoomTemplate[K],
    ) => {
      setRoom((previous) => ({
        ...previous,
        [key]: value,
      }));
    };

  const toggleDoor = (
    direction: Direction,
  ) => {
    setRoom((previous) => {
      const hasDoor =
        previous.doors.includes(
          direction,
        );

      return {
        ...previous,

        doors: hasDoor
          ? previous.doors.filter(
              (door) =>
                door !== direction,
            )
          : [
              ...previous.doors,
              direction,
            ],
      };
    });
  };

  const hasBoundaryWall = (direction: Direction): boolean =>
    room.boundaryWalls?.[direction] !== false;

  const toggleBoundaryWall = (direction: Direction) => {
    setRoom((previous) => ({
      ...previous,
      boundaryWalls: {
        ...previous.boundaryWalls,
        [direction]: !hasBoundaryWall(direction),
      },
    }));
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">

      <div className="border-b border-white/10 p-3">

        <div className="mb-3 text-xs font-semibold tracking-wider text-white/50">
          ROOM
        </div>

        <div className="flex flex-col gap-2">

          <label className="flex items-center gap-2">
            <span className="w-20 text-xs text-white/50">
              ID
            </span>

            <input
              value={room.id}
              onChange={(event) =>
                updateRoom(
                  "id",
                  event.target.value,
                )
              }
              className="
                w-full
                rounded
                border
                border-white/15
                bg-black/30
                px-2
                py-1
                text-sm
              "
            />
          </label>

          <NumberField
            label="Width"
            value={room.width}
            min={16}
            onChange={(value) =>
              updateRoom(
                "width",
                value,
              )
            }
          />

          <NumberField
            label="Height"
            value={room.height}
            min={16}
            onChange={(value) =>
              updateRoom(
                "height",
                value,
              )
            }
          />

          <NumberField
            label="Wall"
            value={
              room.wallThickness
            }
            min={1}
            onChange={(value) =>
              updateRoom(
                "wallThickness",
                value,
              )
            }
          />

          <NumberField
            label="Door"
            value={
              room.doorWidth
            }
            min={1}
            onChange={(value) =>
              updateRoom(
                "doorWidth",
                value,
              )
            }
          />

          <NumberField
            label="Weight"
            value={
              room.weight ?? 1
            }
            min={0}
            onChange={(value) =>
              updateRoom(
                "weight",
                value,
              )
            }
          />

        </div>
      </div>

      <div className="border-b border-white/10 p-3">

        <div className="mb-3 text-xs font-semibold tracking-wider text-white/50">
          DOORS
        </div>

        <div className="grid grid-cols-2 gap-2">

          {(
            [
              "N",
              "S",
              "E",
              "W",
            ] as Direction[]
          ).map((direction) => (
            <label
              key={direction}
              className="
                flex
                items-center
                gap-2
                rounded
                bg-white/5
                px-2
                py-2
                text-xs
              "
            >
              <input
                type="checkbox"
                checked={
                  room.doors.includes(
                    direction,
                  )
                }
                onChange={() =>
                  toggleDoor(
                    direction,
                  )
                }
              />

              {direction}
            </label>
          ))}

        </div>

      </div>

      <div className="border-b border-white/10 p-3">

        <div className="mb-1 text-xs font-semibold tracking-wider text-white/50">
          BOUNDARY WALLS
        </div>

        <div className="mb-2 text-[11px] leading-relaxed text-white/35">
          Unchecking a side stops the automatic outer wall there — turn all
          four off for a corridor, which supplies its own walls around its
          floor areas instead.
        </div>

        <div className="grid grid-cols-2 gap-2">

          {(
            [
              "N",
              "S",
              "E",
              "W",
            ] as Direction[]
          ).map((direction) => (
            <label
              key={direction}
              className="
                flex
                items-center
                gap-2
                rounded
                bg-white/5
                px-2
                py-2
                text-xs
              "
            >
              <input
                type="checkbox"
                checked={hasBoundaryWall(direction)}
                onChange={() => toggleBoundaryWall(direction)}
              />

              {direction}
            </label>
          ))}

        </div>

      </div>

      <SelectedObjectInspector
        room={room}
        setRoom={setRoom}
        selected={selected}
      />

    </div>
  );
}
