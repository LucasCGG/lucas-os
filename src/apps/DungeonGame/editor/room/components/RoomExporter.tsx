import { useMemo } from "react";

import { RoomTemplate } from "../../../scenes/RoomTemplate";

interface RoomExporterProps {
  room: RoomTemplate;
}

function roomToTypeScript(
  room: RoomTemplate,
): string {
  const exportName =
    room.id
      .replace(
        /[^a-zA-Z0-9_]/g,
        "_",
      )
      .replace(
        /(^|_)(\w)/g,
        (_, __, letter) =>
          letter.toUpperCase(),
      );

  const walls = room.walls
    .map(
      ({ x, y, width, height }) =>
        `    { x: ${x}, y: ${y}, width: ${width}, height: ${height} },`,
    )
    .join("\n");

  const pillars = room.pillars
    .map(({ x, y, variant }) =>
      variant !== undefined
        ? `    { x: ${x}, y: ${y}, variant: ${variant} },`
        : `    { x: ${x}, y: ${y} },`,
    )
    .join("\n");

  const chestSpots = room.chestSpots
    .map(
      ({ x, y }) =>
        `    { x: ${x}, y: ${y} },`,
    )
    .join("\n");

  const decorations = (room.decorations ?? [])
    .map(({ x, y, kind, scale, rotation }) => {
      const props = [
        `x: ${x}`,
        `y: ${y}`,
        `kind: "${kind}"`,
        ...(scale !== undefined ? [`scale: ${scale}`] : []),
        ...(rotation !== undefined ? [`rotation: ${rotation}`] : []),
      ];

      return `    { ${props.join(", ")} },`;
    })
    .join("\n");

  const rectList = (regions: { x: number; y: number; width: number; height: number }[]) =>
    regions
      .map(
        ({ x, y, width, height }) =>
          `    { x: ${x}, y: ${y}, width: ${width}, height: ${height} },`,
      )
      .join("\n");

  const floorRegions = rectList(room.floorRegions ?? []);
  const waterRegions = rectList(room.waterRegions ?? []);

  const boundaryWalls = room.boundaryWalls
    ? (["N", "S", "E", "W"] as const)
        .filter((direction) => room.boundaryWalls?.[direction] === false)
        .map((direction) => `${direction}: false`)
        .join(", ")
    : "";

  const doors =
    room.doors
      .map(
        (door) =>
          `"${door}"`,
      )
      .join(", ");

  const tags =
    (room.tags ?? [])
      .map(
        (tag) =>
          `"${tag}"`,
      )
      .join(", ");

  return `import { RoomTemplate } from "./RoomTemplate";

export const ${exportName}: RoomTemplate = {
  id: "${room.id}",

  width: ${room.width},
  height: ${room.height},

  wallThickness: ${room.wallThickness},
  doorWidth: ${room.doorWidth},

  walls: [
${walls}
  ],

  pillars: [
${pillars}
  ],

  chestSpots: [
${chestSpots}
  ],

  decorations: [
${decorations}
  ],
${
  floorRegions
    ? `
  floorRegions: [
${floorRegions}
  ],
`
    : ""
}${
  waterRegions
    ? `
  waterRegions: [
${waterRegions}
  ],
`
    : ""
}
  doors: [${doors}],
${boundaryWalls ? `\n  boundaryWalls: { ${boundaryWalls} },\n` : ""}
  tags: [${tags}],

  weight: ${room.weight ?? 1},
};
`;
}

export function RoomExporter({
  room,
}: RoomExporterProps) {
  const code = useMemo(
    () => roomToTypeScript(room),
    [room],
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      console.error(
        "Could not copy room code",
      );
    }
  };

  return (
    <div className="border-t border-white/10 p-3">

      <div className="mb-2 text-xs font-semibold tracking-wider text-white/50">
        EXPORT
      </div>

      <code
        className="
          block
          max-h-48
          overflow-auto
          whitespace-pre
          rounded
          bg-black/40
          p-2
          text-[10px]
          leading-relaxed
          text-emerald-200
        "
      >
        {code}
      </code>

      <button
        onClick={copyCode}
        className="
          mt-2
          w-full
          rounded
          bg-white/10
          px-3
          py-2
          text-xs
          text-white/80
          hover:bg-white/20
        "
      >
        Copy TypeScript
      </button>

    </div>
  );
}
