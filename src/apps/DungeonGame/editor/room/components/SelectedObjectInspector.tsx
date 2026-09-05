import {
  Dispatch,
  SetStateAction,
} from "react";
import { RoomTemplate } from "../../../scenes/RoomTemplate";
import { EditorSelection } from "../types/RoomEditorState";

interface Props {
  room: RoomTemplate;

  setRoom: Dispatch<
    SetStateAction<RoomTemplate>
  >;

  selected: EditorSelection;
}

export function SelectedObjectInspector({
  room,
  setRoom,
  selected,
}: Props) {
  if (
    selected.type === null ||
    selected.index < 0
  ) {
    return (
      <div className="p-3 text-xs text-white/40">
        No object selected
      </div>
    );
  }

  const deleteObject = () => {
    setRoom((previous) => {
      if (selected.type === "wall") {
        return {
          ...previous,
          walls: previous.walls.filter(
            (_, index) =>
              index !== selected.index,
          ),
        };
      }

      if (selected.type === "pillar") {
        return {
          ...previous,
          pillars: previous.pillars.filter(
            (_, index) =>
              index !== selected.index,
          ),
        };
      }

      if (selected.type === "chest") {
        return {
          ...previous,
          chestSpots:
            previous.chestSpots.filter(
              (_, index) =>
                index !== selected.index,
            ),
        };
      }

      return previous;
    });
  };

  const updateWall = (
    property: "x" | "y" | "width" | "height",
    value: number,
  ) => {
    setRoom((previous) => {
      const walls = [...previous.walls];

      const wall = walls[selected.index];

      if (!wall) {
        return previous;
      }

      walls[selected.index] = {
        ...wall,
        [property]: value,
      };

      return {
        ...previous,
        walls,
      };
    });
  };

  const updatePoint = (
    property: "x" | "y",
    value: number,
  ) => {
    setRoom((previous) => {
      if (selected.type === "pillar") {
        const pillars = [...previous.pillars];

        const pillar = pillars[selected.index];

        if (!pillar) {
          return previous;
        }

        pillars[selected.index] = {
          ...pillar,
          [property]: value,
        };

        return {
          ...previous,
          pillars,
        };
      }

      if (selected.type === "chest") {
        const chestSpots = [
          ...previous.chestSpots,
        ];

        const chest =
          chestSpots[selected.index];

        if (!chest) {
          return previous;
        }

        chestSpots[selected.index] = {
          ...chest,
          [property]: value,
        };

        return {
          ...previous,
          chestSpots,
        };
      }

      return previous;
    });
  };

  const input = (
    label: string,
    value: number,
    onChange: (value: number) => void,
  ) => (
    <label className="flex items-center gap-2">
      <span className="w-12 text-xs text-white/50">
        {label}
      </span>

      <input
        type="number"
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value) || 0,
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
  );

  return (
    <div className="p-3">

      <div className="mb-3 text-xs font-semibold tracking-wider text-white/50">
        SELECTED {selected.type?.toUpperCase()}
      </div>

      <div className="flex flex-col gap-2">

        {selected.type === "wall" &&
          (() => {
            const wall =
              room.walls[selected.index];

            if (!wall) {
              return null;
            }

            return (
              <>
                {input(
                  "X",
                  wall.x,
                  (value) =>
                    updateWall(
                      "x",
                      value,
                    ),
                )}

                {input(
                  "Y",
                  wall.y,
                  (value) =>
                    updateWall(
                      "y",
                      value,
                    ),
                )}

                {input(
                  "W",
                  wall.width,
                  (value) =>
                    updateWall(
                      "width",
                      value,
                    ),
                )}

                {input(
                  "H",
                  wall.height,
                  (value) =>
                    updateWall(
                      "height",
                      value,
                    ),
                )}
              </>
            );
          })()}

        {selected.type === "pillar" &&
          (() => {
            const pillar =
              room.pillars[
                selected.index
              ];

            if (!pillar) {
              return null;
            }

            return (
              <>
                {input(
                  "X",
                  pillar.x,
                  (value) =>
                    updatePoint(
                      "x",
                      value,
                    ),
                )}

                {input(
                  "Y",
                  pillar.y,
                  (value) =>
                    updatePoint(
                      "y",
                      value,
                    ),
                )}
              </>
            );
          })()}

        {selected.type === "chest" &&
          (() => {
            const chest =
              room.chestSpots[
                selected.index
              ];

            if (!chest) {
              return null;
            }

            return (
              <>
                {input(
                  "X",
                  chest.x,
                  (value) =>
                    updatePoint(
                      "x",
                      value,
                    ),
                )}

                {input(
                  "Y",
                  chest.y,
                  (value) =>
                    updatePoint(
                      "y",
                      value,
                    ),
                )}
              </>
            );
          })()}

      </div>

      <button
        onClick={deleteObject}
        className="
          mt-4
          w-full
          rounded
          bg-red-500/20
          px-3
          py-2
          text-xs
          text-red-200
          hover:bg-red-500/30
        "
      >
        Delete
      </button>

    </div>
  );
}
