import {
  Dispatch,
  SetStateAction,
} from "react";
import { RoomTemplate } from "../../../scenes/RoomTemplate";
import { EditorSelection } from "../types/RoomEditorState";
import { DECOR_ASSETS } from "../../../objects/Decoration";

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

      if (selected.type === "decoration") {
        return {
          ...previous,
          decorations:
            (previous.decorations ?? []).filter(
              (_, index) =>
                index !== selected.index,
            ),
        };
      }

      if (selected.type === "floor") {
        return {
          ...previous,
          floorRegions:
            (previous.floorRegions ?? []).filter(
              (_, index) => index !== selected.index,
            ),
        };
      }

      if (selected.type === "water") {
        return {
          ...previous,
          waterRegions:
            (previous.waterRegions ?? []).filter(
              (_, index) => index !== selected.index,
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

  const updateRegion = (
    field: "floorRegions" | "waterRegions",
    property: "x" | "y" | "width" | "height",
    value: number,
  ) => {
    setRoom((previous) => {
      const regions = [...(previous[field] ?? [])];

      const region = regions[selected.index];

      if (!region) {
        return previous;
      }

      regions[selected.index] = {
        ...region,
        [property]: value,
      };

      return {
        ...previous,
        [field]: regions,
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

      if (selected.type === "decoration") {
        const decorations = [
          ...(previous.decorations ?? []),
        ];

        const decoration =
          decorations[selected.index];

        if (!decoration) {
          return previous;
        }

        decorations[selected.index] = {
          ...decoration,
          [property]: value,
        };

        return {
          ...previous,
          decorations,
        };
      }

      return previous;
    });
  };

  const updateDecoration = (
    property: "kind" | "scale" | "rotation",
    value: string | number,
  ) => {
    setRoom((previous) => {
      const decorations = [
        ...(previous.decorations ?? []),
      ];

      const decoration =
        decorations[selected.index];

      if (!decoration) {
        return previous;
      }

      decorations[selected.index] = {
        ...decoration,
        [property]: value,
      };

      return {
        ...previous,
        decorations,
      };
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

        {selected.type === "decoration" &&
          (() => {
            const decoration =
              (room.decorations ?? [])[
                selected.index
              ];

            if (!decoration) {
              return null;
            }

            return (
              <>
                {input(
                  "X",
                  decoration.x,
                  (value) =>
                    updatePoint(
                      "x",
                      value,
                    ),
                )}

                {input(
                  "Y",
                  decoration.y,
                  (value) =>
                    updatePoint(
                      "y",
                      value,
                    ),
                )}

                <label className="flex items-center gap-2">
                  <span className="w-12 text-xs text-white/50">
                    Kind
                  </span>

                  <select
                    value={decoration.kind}
                    onChange={(event) =>
                      updateDecoration(
                        "kind",
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
                  >
                    {Object.keys(DECOR_ASSETS).map(
                      (kind) => (
                        <option
                          key={kind}
                          value={kind}
                        >
                          {kind}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                {input(
                  "Scale",
                  decoration.scale ?? 1,
                  (value) =>
                    updateDecoration(
                      "scale",
                      value,
                    ),
                )}

                {input(
                  "Rotate",
                  decoration.rotation ?? 0,
                  (value) =>
                    updateDecoration(
                      "rotation",
                      value,
                    ),
                )}
              </>
            );
          })()}

        {(selected.type === "floor" || selected.type === "water") &&
          (() => {
            const field =
              selected.type === "floor" ? "floorRegions" : "waterRegions";

            const region = (room[field] ?? [])[selected.index];

            if (!region) {
              return null;
            }

            return (
              <>
                {input("X", region.x, (value) =>
                  updateRegion(field, "x", value),
                )}

                {input("Y", region.y, (value) =>
                  updateRegion(field, "y", value),
                )}

                {input("W", region.width, (value) =>
                  updateRegion(field, "width", value),
                )}

                {input("H", region.height, (value) =>
                  updateRegion(field, "height", value),
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
